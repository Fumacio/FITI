/**
 * Detector de actividad de voz (VAD) basado en energía con umbral adaptativo.
 *
 * Recibe audio mono a 16 kHz en bloques arbitrarios y emite un segmento cada
 * vez que alguien termina de hablar (silencio prolongado) o cuando un turno
 * supera la duración máxima. Cada segmento se transcribe por separado.
 */
export interface SegmenterOptions {
  sampleRate: number;
  /** Tamaño de trama para medir energía. */
  frameMs: number;
  /** Silencio necesario para cerrar un turno. */
  endSilenceMs: number;
  /** Duración mínima para considerar que hubo habla. */
  minSpeechMs: number;
  /** Corte forzado de turnos largos para mostrar texto sin esperar demasiado. */
  maxSegmentMs: number;
  /** Audio previo incluido para no cortar el inicio de la primera palabra. */
  preRollMs: number;
  /** La voz debe superar el ruido de fondo por este factor. */
  speechToNoiseRatio: number;
  /** Energía mínima absoluta (RMS) para considerar voz. */
  minRms: number;
}

export const DEFAULT_SEGMENTER_OPTIONS: SegmenterOptions = {
  sampleRate: 16000,
  frameMs: 30,
  endSilenceMs: 700,
  minSpeechMs: 350,
  maxSegmentMs: 12000,
  preRollMs: 250,
  speechToNoiseRatio: 3,
  minRms: 0.008,
};

export interface Segment {
  audio: Float32Array;
  durationSec: number;
}

export class Segmenter {
  private readonly opts: SegmenterOptions;
  private readonly frameSize: number;
  private pending: Float32Array = new Float32Array(0);
  private preRoll: Float32Array[] = [];
  private speech: Float32Array[] = [];
  private speechFrames = 0;
  private voicedFrames = 0;
  private silenceFrames = 0;
  private noiseFloor = 0.003;
  private lastLevel = 0;

  constructor(
    private readonly onSegment: (segment: Segment) => void,
    options: Partial<SegmenterOptions> = {},
  ) {
    this.opts = { ...DEFAULT_SEGMENTER_OPTIONS, ...options };
    this.frameSize = Math.round((this.opts.sampleRate * this.opts.frameMs) / 1000);
  }

  /** Nivel RMS de la última trama (para el indicador de audio). */
  get level(): number {
    return this.lastLevel;
  }

  get isSpeaking(): boolean {
    return this.speech.length > 0;
  }

  push(chunk: Float32Array): void {
    const data = concat([this.pending, chunk]);
    let offset = 0;
    while (offset + this.frameSize <= data.length) {
      this.processFrame(data.subarray(offset, offset + this.frameSize));
      offset += this.frameSize;
    }
    this.pending = data.slice(offset);
  }

  /** Emite lo que haya en curso (p. ej. al terminar la llamada). */
  flush(): void {
    if (this.speech.length > 0) this.emit();
  }

  /** Descarta todo el audio en memoria sin emitirlo. */
  reset(): void {
    this.pending = new Float32Array(0);
    this.preRoll = [];
    this.speech = [];
    this.speechFrames = 0;
    this.voicedFrames = 0;
    this.silenceFrames = 0;
  }

  private processFrame(frame: Float32Array): void {
    const rms = computeRms(frame);
    this.lastLevel = rms;
    const threshold = Math.max(this.opts.minRms, this.noiseFloor * this.opts.speechToNoiseRatio);
    const voiced = rms >= threshold;
    const copy = frame.slice();

    if (this.speech.length === 0) {
      if (voiced) {
        this.speech = [...this.preRoll, copy];
        this.preRoll = [];
        this.speechFrames = 1;
        this.voicedFrames = 1;
        this.silenceFrames = 0;
        return;
      }
      // Solo actualizamos el ruido de fondo mientras nadie habla.
      this.noiseFloor = this.noiseFloor * 0.95 + rms * 0.05;
      this.preRoll.push(copy);
      const maxPreRoll = Math.ceil(this.opts.preRollMs / this.opts.frameMs);
      while (this.preRoll.length > maxPreRoll) this.preRoll.shift();
      return;
    }

    this.speech.push(copy);
    this.speechFrames++;
    if (voiced) {
      this.voicedFrames++;
      this.silenceFrames = 0;
    } else {
      this.silenceFrames++;
    }

    const silenceMs = this.silenceFrames * this.opts.frameMs;
    const totalMs = this.speechFrames * this.opts.frameMs;
    if (silenceMs >= this.opts.endSilenceMs || totalMs >= this.opts.maxSegmentMs) {
      this.emit();
    }
  }

  private emit(): void {
    const voicedMs = this.voicedFrames * this.opts.frameMs;
    // Recortamos el silencio final, dejando un pequeño margen.
    const tailFrames = Math.max(0, this.silenceFrames - Math.ceil(200 / this.opts.frameMs));
    const frames = this.speech.slice(0, this.speech.length - tailFrames);
    this.speech = [];
    this.speechFrames = 0;
    this.voicedFrames = 0;
    this.silenceFrames = 0;

    if (voicedMs < this.opts.minSpeechMs) return;
    const audio = concat(frames);
    this.onSegment({ audio, durationSec: audio.length / this.opts.sampleRate });
  }
}

export function computeRms(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / Math.max(1, frame.length));
}

function concat(parts: Float32Array[]): Float32Array {
  let length = 0;
  for (const p of parts) length += p.length;
  const out = new Float32Array(length);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
