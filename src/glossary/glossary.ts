import type { Lang } from '../core/messages';

export interface GlossaryEntry {
  abbr?: string;
  /** Formas en inglés; la primera es la preferida. */
  en: string[];
  /** Formas en español; la primera es la preferida. */
  es: string[];
  category: string;
}

/** Interpreta el formato de texto de `terms.ts`. */
export function parseGlossary(source: string): GlossaryEntry[] {
  const entries: GlossaryEntry[] = [];
  let category = '';
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      category = line.slice(1).trim();
      continue;
    }
    const [abbr, en, es] = raw.split('|').map((p) => p.trim());
    const entry = makeEntry({ abbr, en, es }, category);
    if (entry) entries.push(entry);
  }
  return entries;
}

/**
 * Valida términos personalizados (p. ej. de `glossary.local.json`):
 * `[{ "abbr": "NPO", "en": "nothing by mouth", "es": ["nada por vía oral", "en ayunas"] }]`
 */
export function parseCustomGlossary(data: unknown): GlossaryEntry[] {
  if (!Array.isArray(data)) return [];
  const out: GlossaryEntry[] = [];
  for (const item of data) {
    if (typeof item !== 'object' || item === null) continue;
    const entry = makeEntry(item as Record<string, unknown>, 'Personal');
    if (entry) out.push(entry);
  }
  return out;
}

function makeEntry(item: Record<string, unknown>, category: string): GlossaryEntry | null {
  const en = forms(item.en);
  const es = forms(item.es);
  const abbr = typeof item.abbr === 'string' && item.abbr.trim() ? item.abbr.trim() : undefined;
  if ((en.length === 0 && !abbr) || es.length === 0) return null;
  return { abbr, en: en.length ? en : [abbr!], es, category };
}

function forms(v: unknown): string[] {
  const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(';') : [];
  return list.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean);
}

/** Minúsculas, sin acentos ni signos de puntuación. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
}

interface Phrase {
  tokens: string[];
  entry: GlossaryEntry;
}

export interface GlossaryMatch {
  entry: GlossaryEntry;
  /** Texto tal como apareció en la transcripción. */
  found: string;
}

export class Glossary {
  private readonly byFirstToken: Record<Lang, Map<string, Phrase[]>> = { en: new Map(), es: new Map() };
  private readonly abbreviations: { re: RegExp; entry: GlossaryEntry }[] = [];

  constructor(readonly entries: GlossaryEntry[]) {
    for (const entry of entries) {
      for (const lang of ['en', 'es'] as const) {
        for (const form of entry[lang]) this.addPhrase(lang, form, entry);
      }
      if (entry.abbr) this.abbreviations.push({ re: abbreviationRegex(entry.abbr), entry });
    }
  }

  private addPhrase(lang: Lang, form: string, entry: GlossaryEntry) {
    const tokens = normalize(form).split(' ').filter(Boolean);
    if (tokens.length === 0) return;
    const map = this.byFirstToken[lang];
    const list = map.get(tokens[0]) ?? [];
    list.push({ tokens, entry });
    map.set(tokens[0], list);
  }

  /** Términos del glosario que aparecen en `text` (dicho en `lang`). Siglas primero. */
  find(text: string, lang: Lang, limit = 6): GlossaryMatch[] {
    const matches: GlossaryMatch[] = [];
    const seen = new Set<GlossaryEntry>();
    const add = (entry: GlossaryEntry, found: string) => {
      if (seen.has(entry)) return;
      seen.add(entry);
      matches.push({ entry, found });
    };

    for (const { re, entry } of this.abbreviations) {
      re.lastIndex = 0;
      const m = re.exec(text);
      if (m) add(entry, m[0]);
    }

    const words = normalize(text).split(' ').filter(Boolean);
    const map = this.byFirstToken[lang];
    let i = 0;
    while (i < words.length) {
      // Las frases más largas primero, para preferir "heart attack" sobre "heart".
      const candidates = [...(map.get(words[i]) ?? []), ...(map.get(singular(words[i])) ?? [])];
      const phrase = candidates
        .sort((a, b) => b.tokens.length - a.tokens.length)
        .find((p) => p.tokens.every((t, k) => tokenMatches(words[i + k], t)));
      if (phrase) {
        add(phrase.entry, words.slice(i, i + phrase.tokens.length).join(' '));
        i += phrase.tokens.length;
      } else {
        i++;
      }
    }
    return matches.slice(0, limit);
  }

  /** Búsqueda manual: coincide en siglas, inglés o español. */
  search(query: string, limit = 25): GlossaryEntry[] {
    const q = normalize(query);
    if (!q) return [];
    const scored: { entry: GlossaryEntry; score: number }[] = [];
    for (const entry of this.entries) {
      const all = [entry.abbr ?? '', ...entry.en, ...entry.es].map(normalize);
      let score = 0;
      for (const f of all) {
        if (f === q) score = Math.max(score, 3);
        else if (f.startsWith(q)) score = Math.max(score, 2);
        else if (f.includes(q)) score = Math.max(score, 1);
      }
      if (score > 0) scored.push({ entry, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.entry);
  }
}

function tokenMatches(word: string | undefined, token: string): boolean {
  if (word === undefined) return false;
  return word === token || singular(word) === token || word === `${token}s` || word === `${token}es`;
}

function singular(word: string): string {
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

/**
 * Las siglas se buscan respetando mayúsculas (para no confundir "OR" con "or")
 * y admitiendo puntos entre letras ("N.P.O.") y plural ("UTIs").
 */
function abbreviationRegex(abbr: string): RegExp {
  const body = [...abbr]
    .map((ch) => (/[A-Z0-9]/.test(ch) ? `${ch}\\.?` : ch.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')))
    .join('');
  return new RegExp(`(?<![A-Za-z0-9])${body}s?(?![A-Za-z0-9])`, 'g');
}
