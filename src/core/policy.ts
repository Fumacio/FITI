/**
 * Política de la empresa de interpretación.
 *
 * Los valores por defecto son los más restrictivos y siguen las prácticas
 * habituales de las agencias de interpretación médica en EE. UU. (HIPAA,
 * códigos de ética NCIHC/IMIA): nada se graba, nada se guarda, nada sale del
 * equipo y la pantalla se borra al terminar la llamada.
 *
 * Cada empresa puede ajustar estos valores con `public/policy.json` sin
 * recompilar la aplicación. Solo se aceptan claves conocidas con el tipo
 * correcto; cualquier otra cosa se ignora.
 */
export interface CompanyPolicy {
  /** Nombre que se muestra en la pantalla de aceptación. */
  companyName: string;

  privacy: {
    /** Borra la transcripción al pulsar "Terminar llamada". */
    clearOnCallEnd: boolean;
    /** Minutos sin actividad tras los que se borra la pantalla (0 = nunca). */
    inactivityClearMinutes: number;
    /** Máximo de intervenciones visibles; las más antiguas se descartan de memoria. */
    maxEntriesOnScreen: number;
    /** Permite seleccionar / copiar texto. */
    allowCopy: boolean;
    /** Difumina el contenido cuando la ventana pierde el foco (p. ej. al compartir pantalla). */
    blurWhenUnfocused: boolean;
    /** Enmascara identificadores largos (SSN, nº de tarjeta, MRN, teléfonos). */
    maskIdentifiers: boolean;
  };

  models: {
    /**
     * "remote": descarga los modelos desde Hugging Face (solo pesos del modelo;
     * el audio nunca sale del equipo).
     * "local": usa solo modelos alojados por la empresa en `localPath`.
     */
    source: 'remote' | 'local';
    localPath: string;
    /**
     * Carpeta con los binarios de ONNX Runtime (.wasm/.mjs). Vacío = CDN
     * jsDelivr. Para funcionar sin conexión, alójelos junto a los modelos.
     */
    wasmPath: string;
    /** Guarda los pesos del modelo en la caché del navegador (no contiene datos de pacientes). */
    cacheInBrowser: boolean;
    asr: string;
    translateEsEn: string;
    translateEnEs: string;
  };

  network: {
    /**
     * Orígenes a los que la aplicación puede conectarse. Cualquier otra
     * petición se bloquea en tiempo de ejecución.
     */
    allowedOrigins: string[];
  };

  display: {
    /** Etiqueta para el hablante que habla inglés. */
    englishSpeakerLabel: string;
    /** Etiqueta para el hablante que habla español. */
    spanishSpeakerLabel: string;
    /** Aviso visible encima de la columna de traducción. */
    machineTranslationNotice: string;
  };

  /**
   * Afirmaciones que el intérprete debe confirmar antes de cada llamada.
   * No se guarda la aceptación: se pide de nuevo en cada sesión.
   */
  acknowledgments: string[];
}

export const DEFAULT_POLICY: CompanyPolicy = {
  companyName: 'Mi empresa de interpretación',
  privacy: {
    clearOnCallEnd: true,
    inactivityClearMinutes: 5,
    maxEntriesOnScreen: 40,
    allowCopy: false,
    blurWhenUnfocused: true,
    maskIdentifiers: false,
  },
  models: {
    source: 'remote',
    localPath: '/models/',
    wasmPath: '',
    cacheInBrowser: true,
    asr: 'onnx-community/whisper-base',
    translateEsEn: 'Xenova/opus-mt-es-en',
    translateEnEs: 'Xenova/opus-mt-en-es',
  },
  network: {
    allowedOrigins: [
      'https://huggingface.co',
      'https://cdn-lfs.huggingface.co',
      'https://cdn-lfs-us-1.huggingface.co',
      'https://cas-bridge.xethub.hf.co',
      'https://cdn.jsdelivr.net',
    ],
  },
  display: {
    englishSpeakerLabel: 'Proveedor (EN)',
    spanishSpeakerLabel: 'Paciente (ES)',
    machineTranslationNotice:
      'Traducción automática de apoyo. Verifique siempre antes de interpretar.',
  },
  acknowledgments: [
    'Mi empresa me ha autorizado por escrito a usar esta herramienta de apoyo durante las llamadas.',
    'Entiendo que la transcripción y la traducción automáticas pueden contener errores y que yo sigo siendo responsable de la interpretación.',
    'No grabaré, copiaré, fotografiaré ni compartiré lo que aparezca en pantalla.',
    'Estoy en un lugar privado donde nadie más puede ver mi pantalla.',
  ],
};

type Section = 'privacy' | 'models' | 'network' | 'display';

/**
 * Combina la política por defecto con un objeto parcial (normalmente
 * `policy.json`). Solo copia claves conocidas cuyo tipo coincide con el del
 * valor por defecto, así un JSON mal escrito no puede desactivar protecciones
 * con valores inesperados.
 */
export function mergePolicy(base: CompanyPolicy, override: unknown): CompanyPolicy {
  const result: CompanyPolicy = structuredClone(base);
  if (!isRecord(override)) return result;

  if (typeof override.companyName === 'string') result.companyName = override.companyName;

  for (const section of ['privacy', 'models', 'network', 'display'] as Section[]) {
    const src = override[section];
    if (!isRecord(src)) continue;
    const dst = result[section] as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(src)) {
      if (!(key in dst)) continue;
      if (sameShape(dst[key], value)) dst[key] = value;
    }
  }

  if (isStringArray(override.acknowledgments)) {
    result.acknowledgments = override.acknowledgments;
  }

  if (result.models.source !== 'remote' && result.models.source !== 'local') {
    result.models.source = base.models.source;
  }
  return result;
}

export async function loadPolicy(url = 'policy.json'): Promise<CompanyPolicy> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_POLICY;
    return mergePolicy(DEFAULT_POLICY, await res.json());
  } catch {
    return DEFAULT_POLICY;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function sameShape(expected: unknown, value: unknown): boolean {
  if (Array.isArray(expected)) return isStringArray(value);
  return typeof expected === typeof value;
}
