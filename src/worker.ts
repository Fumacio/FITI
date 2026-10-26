/// <reference lib="webworker" />
/**
 * Worker de modelos: transcripción (Whisper) y traducción (MarianMT).
 *
 * Todo se ejecuta en el navegador del intérprete. El audio y el texto nunca
 * salen de este equipo; las únicas descargas permitidas son los pesos de los
 * modelos desde los orígenes que autorice la política.
 */
import {
  env,
  pipeline,
  LogitsProcessor,
  LogitsProcessorList,
  type AutomaticSpeechRecognitionPipeline,
  type TranslationPipeline,
  type Tensor,
} from '@huggingface/transformers';
import { installNetworkGuard } from './core/networkGuard';
import { isLikelyHallucination } from './core/hallucinations';
import type { CompanyPolicy } from './core/policy';
import type { FromWorker, Lang, ToWorker } from './core/messages';

declare const self: DedicatedWorkerGlobalScope;

let asr: AutomaticSpeechRecognitionPipeline | null = null;
let esToEn: TranslationPipeline | null = null;
let enToEs: TranslationPipeline | null = null;
let queue: Promise<void> = Promise.resolve();

const post = (msg: FromWorker) => self.postMessage(msg);
// Los tipos genéricos de `pipeline` son demasiado complejos para TypeScript; tipamos el resultado a mano.
const load = pipeline as unknown as (task: string, model: string, options: object) => Promise<unknown>;

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const msg = e.data;
  if (msg.type === 'init') {
    init(msg.policy).catch((err) => post({ type: 'error', message: errorMessage(err) }));
  } else if (msg.type === 'segment') {
    // Los segmentos se procesan en orden, uno tras otro.
    queue = queue
      .then(() => processSegment(msg.id, msg.audio, msg.durationSec))
      .catch((err) => {
        post({ type: 'error', message: errorMessage(err) });
        post({ type: 'skipped', id: msg.id });
      });
  }
};

async function init(policy: CompanyPolicy): Promise<void> {
  const local = policy.models.source === 'local';
  installNetworkGuard(local ? [] : policy.network.allowedOrigins, (url) => post({ type: 'blocked', url }));

  env.allowRemoteModels = !local;
  env.allowLocalModels = local;
  env.localModelPath = policy.models.localPath;
  env.useBrowserCache = policy.models.cacheInBrowser;
  if (policy.models.wasmPath && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.wasmPaths = policy.models.wasmPath;
  }

  const device = (await hasWebGPU()) ? 'webgpu' : 'wasm';
  const progress_callback = (p: { status: string; file?: string; progress?: number }) => {
    if (p.status === 'progress' && p.file) {
      post({ type: 'progress', file: p.file, progress: p.progress ?? 0 });
    }
  };

  asr = (await load('automatic-speech-recognition', policy.models.asr, {
    device,
    dtype: device === 'webgpu' ? { encoder_model: 'fp32', decoder_model_merged: 'q4' } : 'q8',
    progress_callback,
  })) as AutomaticSpeechRecognitionPipeline;

  [esToEn, enToEs] = (await Promise.all([
    load('translation', policy.models.translateEsEn, { dtype: 'q8', progress_callback }),
    load('translation', policy.models.translateEnEs, { dtype: 'q8', progress_callback }),
  ])) as [TranslationPipeline, TranslationPipeline];

  post({ type: 'ready', device });
}

async function processSegment(id: number, audio: Float32Array, durationSec: number): Promise<void> {
  if (!asr || !esToEn || !enToEs) {
    post({ type: 'skipped', id });
    return;
  }

  const { input_features } = await asr.processor(audio);
  const lang = await detectLanguage(asr, input_features);

  const output = (await asr.model.generate({
    inputs: input_features,
    language: lang,
    task: 'transcribe',
    max_new_tokens: 220,
  } as Record<string, unknown>)) as Tensor;
  const text = asr.tokenizer.batch_decode(output, { skip_special_tokens: true })[0].trim();

  if (isLikelyHallucination(text, durationSec)) {
    post({ type: 'skipped', id });
    return;
  }

  const translator = lang === 'es' ? esToEn : enToEs;
  const result = (await translator(text)) as { translation_text: string }[];
  const translation = result[0]?.translation_text?.trim() ?? '';

  post({ type: 'result', id, lang, text, translation });
}

/** Solo permite generar los tokens indicados (aquí: <|en|> y <|es|>). */
class AllowOnlyTokens extends LogitsProcessor {
  constructor(private readonly allowed: number[]) {
    super();
  }

  _call(inputIds: bigint[][], logits: Tensor): Tensor {
    for (let i = 0; i < inputIds.length; i++) {
      const data = (logits as unknown as Tensor[])[i].data as Float32Array;
      const keep = this.allowed.map((t) => data[t]);
      data.fill(-Infinity);
      this.allowed.forEach((t, k) => (data[t] = keep[k]));
    }
    return logits;
  }
}

/**
 * Whisper predice el idioma como primer token tras <|startoftranscript|>.
 * Restringimos esa predicción a inglés o español, que son los únicos idiomas
 * de la llamada.
 */
async function detectLanguage(model: AutomaticSpeechRecognitionPipeline, inputFeatures: Tensor): Promise<Lang> {
  const config = model.model.generation_config as unknown as {
    decoder_start_token_id: number;
    lang_to_id: Record<string, number>;
  };
  const en = config.lang_to_id['<|en|>'];
  const es = config.lang_to_id['<|es|>'];

  const processors = new LogitsProcessorList();
  processors.push(new AllowOnlyTokens([en, es]));
  const out = (await model.model.generate({
    inputs: inputFeatures,
    decoder_input_ids: [config.decoder_start_token_id],
    max_new_tokens: 1,
    logits_processor: processors,
  } as Record<string, unknown>)) as Tensor;

  const ids = out.tolist() as bigint[][];
  return Number(ids[0].at(-1)) === es ? 'es' : 'en';
}

async function hasWebGPU(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
