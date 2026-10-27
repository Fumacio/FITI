/**
 * Protocolo de llamada de la empresa: guiones (apertura, cierre, espera,
 * intervenciones…), recordatorios y tiempos de espera.
 *
 * Los guiones de cada empresa suelen ser confidenciales, así que se cargan de
 * `public/protocol.local.json` (excluido de git). Si no existe, se usa
 * `public/protocol.example.json`, que es genérico.
 */
export type Audience = 'client' | 'lep' | 'both';

export interface ProtocolScript {
  /** Cuándo usarlo, p. ej. "Pedir repetición al proveedor". */
  title: string;
  to: Audience;
  en?: string;
  es?: string;
}

export interface ProtocolSection {
  title: string;
  notes: string[];
  scripts: ProtocolScript[];
}

export interface Protocol {
  name: string;
  interpreter: { name: string; id: string; language: string };
  hold: {
    maxMinutes: number;
    refreshEveryMinutes: number;
    refresh: { en: string; es: string };
  };
  reminders: string[];
  sections: ProtocolSection[];
}

export const EMPTY_PROTOCOL: Protocol = {
  name: 'Sin protocolo',
  interpreter: { name: '', id: '', language: 'Spanish' },
  hold: { maxMinutes: 15, refreshEveryMinutes: 10, refresh: { en: '', es: '' } },
  reminders: [],
  sections: [],
};

export async function loadProtocol(base: string): Promise<Protocol> {
  for (const file of ['protocol.local.json', 'protocol.example.json']) {
    try {
      const res = await fetch(`${base}${file}`, { cache: 'no-store' });
      if (!res.ok || !res.headers.get('content-type')?.includes('json')) continue;
      return parseProtocol(await res.json());
    } catch {
      // probar el siguiente
    }
  }
  return EMPTY_PROTOCOL;
}

export function parseProtocol(data: unknown): Protocol {
  const d = record(data);
  const interpreter = record(d.interpreter);
  const hold = record(d.hold);
  const refresh = record(hold.refresh);
  return {
    name: str(d.name) || EMPTY_PROTOCOL.name,
    interpreter: {
      name: str(interpreter.name),
      id: str(interpreter.id),
      language: str(interpreter.language) || EMPTY_PROTOCOL.interpreter.language,
    },
    hold: {
      maxMinutes: positive(hold.maxMinutes, EMPTY_PROTOCOL.hold.maxMinutes),
      refreshEveryMinutes: positive(hold.refreshEveryMinutes, EMPTY_PROTOCOL.hold.refreshEveryMinutes),
      refresh: { en: str(refresh.en), es: str(refresh.es) },
    },
    reminders: strings(d.reminders),
    sections: (Array.isArray(d.sections) ? d.sections : []).map((s) => {
      const section = record(s);
      return {
        title: str(section.title),
        notes: strings(section.notes),
        scripts: (Array.isArray(section.scripts) ? section.scripts : []).map((x) => {
          const script = record(x);
          const to = script.to === 'lep' || script.to === 'both' ? script.to : 'client';
          return { title: str(script.title), to, en: str(script.en) || undefined, es: str(script.es) || undefined };
        }),
      };
    }),
  };
}

/** Sustituye {name}, {id} y {language} con los datos del intérprete. */
export function fillPlaceholders(text: string, p: Protocol): string {
  return text
    .replace(/\{name\}/g, p.interpreter.name || '(nombre)')
    .replace(/\{id\}/g, p.interpreter.id || '(ID)')
    .replace(/\{language\}/g, p.interpreter.language);
}

export type HoldStage = 'ok' | 'refresh' | 'expired';

/** Estado de la espera tras `elapsedMs`: cuándo refrescar la línea y cuándo se agota. */
export function holdStage(elapsedMs: number, p: Protocol): { stage: HoldStage; nextRefreshMs: number } {
  const max = p.hold.maxMinutes * 60_000;
  const every = p.hold.refreshEveryMinutes * 60_000;
  if (elapsedMs >= max) return { stage: 'expired', nextRefreshMs: 0 };
  const sinceRefresh = elapsedMs % every;
  // Aviso durante 1 minuto después de cada intervalo de refresco.
  const stage = elapsedMs >= every && sinceRefresh < 60_000 ? 'refresh' : 'ok';
  return { stage, nextRefreshMs: every - sinceRefresh };
}

function record(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}
function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}
function positive(v: unknown, fallback: number): number {
  return typeof v === 'number' && v > 0 ? v : fallback;
}
