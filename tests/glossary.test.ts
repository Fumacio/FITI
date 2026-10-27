import { describe, expect, it } from 'vitest';
import { Glossary, normalize, parseCustomGlossary, parseGlossary } from '../src/glossary/glossary';
import { BUILTIN_GLOSSARY } from '../src/glossary/terms';

const glossary = new Glossary(parseGlossary(BUILTIN_GLOSSARY));
const found = (text: string, lang: 'en' | 'es') => glossary.find(text, lang, 20).map((m) => m.entry.en[0]);

describe('glosario integrado', () => {
  it('se interpreta sin entradas vacías', () => {
    const entries = parseGlossary(BUILTIN_GLOSSARY);
    expect(entries.length).toBeGreaterThan(400);
    for (const e of entries) {
      expect(e.en.length).toBeGreaterThan(0);
      expect(e.es.length).toBeGreaterThan(0);
    }
  });
});

describe('Glossary.find', () => {
  it('detecta siglas con o sin puntos y en plural, respetando mayúsculas', () => {
    expect(found('Keep him NPO after midnight', 'en')).toContain('nothing by mouth');
    expect(found('She has had two U.T.I.s this year', 'en')).toContain('urinary tract infection');
    expect(found('Take it or leave it', 'en')).not.toContain('operating room');
  });

  it('prefiere la frase más larga y tolera plurales', () => {
    const terms = found('He had a heart attack and has varicose veins', 'en');
    expect(terms).toContain('heart attack');
    expect(terms).toContain('varicose veins');
    expect(found('I get panic attacks at night', 'en')).toContain('panic attack');
  });

  it('reconoce términos en español sin importar acentos', () => {
    expect(found('Tengo falta de aire y presion alta', 'es')).toEqual(
      expect.arrayContaining(['shortness of breath', 'hypertension']),
    );
    expect(found('Me hicieron una cesárea', 'es')).toContain('c-section');
  });

  it('limita el número de resultados', () => {
    expect(glossary.find('fever cough chills rash nausea vomiting diarrhea', 'en', 3)).toHaveLength(3);
  });
});

describe('Glossary.search', () => {
  it('busca por sigla, inglés o español', () => {
    expect(glossary.search('npo')[0].abbr).toBe('NPO');
    expect(glossary.search('culebrilla')[0].en[0]).toBe('shingles');
    expect(glossary.search('stroke').map((e) => e.en[0])).toContain('stroke');
  });
});

describe('glosario personal', () => {
  it('acepta entradas válidas y descarta las incompletas', () => {
    const custom = parseCustomGlossary([
      { abbr: 'ABG', en: 'arterial blood gas', es: ['gasometría arterial'] },
      { en: 'sin traducción' },
      'texto',
    ]);
    expect(custom).toHaveLength(1);
    expect(new Glossary(custom).find('We need an ABG', 'en')[0].entry.es[0]).toBe('gasometría arterial');
  });

  it('normalize quita acentos y puntuación', () => {
    expect(normalize('¿Le duele el estómago?')).toBe('le duele el estomago');
  });
});
