import type { CompanyPolicy } from './policy';

export type Lang = 'en' | 'es';

export type ToWorker =
  | { type: 'init'; policy: CompanyPolicy }
  | { type: 'segment'; id: number; audio: Float32Array; durationSec: number };

export type FromWorker =
  | { type: 'progress'; file: string; progress: number }
  | { type: 'ready'; device: string }
  | { type: 'result'; id: number; lang: Lang; text: string; translation: string }
  | { type: 'skipped'; id: number }
  | { type: 'blocked'; url: string }
  | { type: 'error'; message: string };
