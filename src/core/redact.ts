/**
 * Enmascara identificadores largos (SSN, tarjetas, números de expediente,
 * teléfonos). Solo se aplica si la política lo activa, porque en muchas
 * llamadas el intérprete necesita repetir esos datos con exactitud.
 *
 * Se conservan los últimos 4 dígitos para que el intérprete pueda confirmar.
 */
const SSN = /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g;
const PHONE = /(?:\+?1[-.\s]?)?\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g;
// Secuencias de 7 o más dígitos, opcionalmente separadas por espacios o guiones.
const LONG_NUMBER = /\b\d(?:[-\s]?\d){6,}\b/g;

export function maskIdentifiers(text: string): string {
  return text.replace(SSN, mask).replace(PHONE, mask).replace(LONG_NUMBER, mask);
}

function mask(match: string): string {
  const digits = match.replace(/\D/g, '');
  if (digits.length < 7) return match;
  return `•••${digits.slice(-4)}`;
}
