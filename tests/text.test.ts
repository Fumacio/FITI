import { describe, expect, it } from 'vitest';
import { maskIdentifiers } from '../src/core/redact';
import { isLikelyHallucination } from '../src/core/hallucinations';

describe('maskIdentifiers', () => {
  it('enmascara SSN, teléfonos y números largos conservando 4 dígitos', () => {
    expect(maskIdentifiers('My SSN is 123-45-6789')).toBe('My SSN is •••6789');
    expect(maskIdentifiers('Llame al (555) 123-4567')).toBe('Llame al •••4567');
    expect(maskIdentifiers('MRN 99887766')).toBe('MRN •••7766');
  });

  it('no toca dosis, fechas ni números cortos', () => {
    const s = 'Take 500 mg twice a day since 03/12/2024, room 12';
    expect(maskIdentifiers(s)).toBe(s);
  });
});

describe('isLikelyHallucination', () => {
  it('descarta frases típicas de subtítulos y repeticiones', () => {
    expect(isLikelyHallucination('Subtítulos realizados por la comunidad de Amara.org', 3)).toBe(true);
    expect(isLikelyHallucination('Thank you for watching!', 4)).toBe(true);
    expect(isLikelyHallucination('', 1)).toBe(true);
    expect(isLikelyHallucination('no no no no no', 2)).toBe(true);
  });

  it('acepta habla real, incluido un "gracias" breve', () => {
    expect(isLikelyHallucination('Me duele el pecho desde ayer.', 3)).toBe(false);
    expect(isLikelyHallucination('Gracias.', 0.8)).toBe(false);
  });
});
