/**
 * Whisper tiende a "inventar" frases típicas de subtítulos cuando recibe
 * ruido o silencio. Estas salidas se descartan para no confundir al intérprete.
 */
const KNOWN_HALLUCINATIONS = [
  'thank you',
  'thanks for watching',
  'thank you for watching',
  'please subscribe',
  'you',
  'bye',
  'gracias',
  'gracias por ver el video',
  'gracias por ver',
  'subtítulos realizados por la comunidad de amara.org',
  'subtitulado por la comunidad de amara.org',
  'suscríbete',
  'música',
  'music',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\[\](){}♪*.,!?¡¿"'…-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Devuelve `true` si el texto parece una alucinación del modelo y no habla real.
 * `durationSec` permite aceptar un "gracias" corto pero rechazarlo si aparece
 * tras un segmento largo (señal de ruido).
 */
export function isLikelyHallucination(text: string, durationSec: number): boolean {
  const n = normalize(text);
  if (n.length === 0) return true;
  if (n.includes('amara org')) return true;
  if (/^(\S+)( \1){3,}$/.test(n)) return true; // misma palabra repetida
  if (KNOWN_HALLUCINATIONS.includes(n)) return durationSec > 2.5 || n.length <= 3;
  return false;
}
