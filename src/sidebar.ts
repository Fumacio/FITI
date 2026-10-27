import { Glossary, parseCustomGlossary, parseGlossary, type GlossaryEntry, type GlossaryMatch } from './glossary/glossary';
import { BUILTIN_GLOSSARY } from './glossary/terms';
import { fillPlaceholders, holdStage, loadProtocol, type Protocol } from './protocol';
import type { Lang } from './core/messages';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/** Carga el glosario integrado más los términos propios de `glossary.local.json`. */
export async function loadGlossary(base: string): Promise<Glossary> {
  const entries = parseGlossary(BUILTIN_GLOSSARY);
  try {
    const res = await fetch(`${base}glossary.local.json`, { cache: 'no-store' });
    if (res.ok && res.headers.get('content-type')?.includes('json')) {
      entries.unshift(...parseCustomGlossary(await res.json()));
    }
  } catch {
    // sin glosario personal
  }
  return new Glossary(entries);
}

export async function setupSidebar(base: string): Promise<Glossary> {
  const [glossary, protocol] = await Promise.all([loadGlossary(base), loadProtocol(base)]);
  setupTabs();
  renderProtocol(protocol);
  setupGlossarySearch(glossary);
  setupHoldTimer(protocol);
  return glossary;
}

/** Etiqueta breve de un término detectado: "NPO = nothing by mouth → nada por vía oral". */
export function termChip(match: GlossaryMatch, lang: Lang): HTMLElement {
  const { entry } = match;
  const chip = document.createElement('span');
  chip.className = 'chip';
  if (entry.abbr) {
    const b = document.createElement('b');
    b.textContent = entry.abbr;
    chip.append(b);
  }
  const [from, to] = lang === 'en' ? [entry.en[0], entry.es[0]] : [entry.es[0], entry.en[0]];
  chip.append(document.createTextNode(entry.abbr && from === entry.abbr ? `→ ${to}` : `${from} → ${to}`));
  return chip;
}

function setupTabs() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.tabs [data-tab]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const b of buttons) {
        const selected = b === button;
        b.setAttribute('aria-selected', String(selected));
        $(`tab-${b.dataset.tab}`).hidden = !selected;
      }
      if (button.dataset.tab === 'glossary') $<HTMLInputElement>('glossary-q').focus();
    });
  }
}

function renderProtocol(protocol: Protocol) {
  $('reminders').replaceChildren(...protocol.reminders.map((r) => el('li', r)));
  $('reminders').hidden = protocol.reminders.length === 0;

  $('sections').replaceChildren(
    ...protocol.sections.map((section, i) => {
      const details = document.createElement('details');
      details.open = i === 0;
      details.append(el('summary', section.title));
      for (const note of section.notes) details.append(el('p', `⚠ ${note}`, 'note'));
      for (const script of section.scripts) {
        const div = el('div', '', 'script');
        const who = { client: 'Al cliente (EN)', lep: 'Al LEP (ES)', both: 'Ambos idiomas' }[script.to];
        div.append(el('div', `${script.title} · ${who}`, 'who'));
        if (script.en) div.append(el('p', fillPlaceholders(script.en, protocol), 'en'));
        if (script.es) div.append(el('p', fillPlaceholders(script.es, protocol), 'es'));
        details.append(div);
      }
      return details;
    }),
  );
}

function setupGlossarySearch(glossary: Glossary) {
  const input = $<HTMLInputElement>('glossary-q');
  const list = $('glossary-results');
  const show = (entries: GlossaryEntry[]) =>
    list.replaceChildren(
      ...entries.map((e) => {
        const li = document.createElement('li');
        if (e.abbr) li.append(el('span', e.abbr, 'abbr'));
        li.append(el('span', e.en[0], 'en'), document.createTextNode(' → '), el('span', e.es[0], 'es'));
        const extra = [...e.en.slice(1), ...e.es.slice(1)];
        li.append(el('small', [e.category, ...extra].join(' · ')));
        return li;
      }),
    );
  input.addEventListener('input', () => show(glossary.search(input.value)));
}

function setupHoldTimer(protocol: Protocol) {
  const button = $<HTMLButtonElement>('hold');
  const reset = $<HTMLButtonElement>('hold-reset');
  const time = $('hold-time');
  const banner = $('hold-banner');
  let start: number | null = null;
  let timer: number | undefined;

  const tick = () => {
    if (start === null) return;
    const elapsed = Date.now() - start;
    const s = Math.floor(elapsed / 1000);
    time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} / ${protocol.hold.maxMinutes}:00`;
    const { stage } = holdStage(elapsed, protocol);
    banner.hidden = stage === 'ok';
    banner.classList.toggle('expired', stage === 'expired');
    if (stage === 'refresh') {
      banner.replaceChildren(
        el('b', `Refresque la línea (cada ${protocol.hold.refreshEveryMinutes} min, en ambos idiomas):`),
        el('p', protocol.hold.refresh.en),
        el('p', protocol.hold.refresh.es),
      );
    } else if (stage === 'expired') {
      banner.replaceChildren(
        el('b', `Se cumplieron ${protocol.hold.maxMinutes} minutos de espera.`),
        el('p', 'Si el cliente no ha vuelto: avise al cliente y al LEP y haga el cierre (guiones en "Espera").'),
      );
    }
  };

  const stop = () => {
    start = null;
    window.clearInterval(timer);
    button.textContent = '⏸ Espera';
    time.hidden = reset.hidden = banner.hidden = true;
  };

  button.addEventListener('click', () => {
    if (start !== null) return stop();
    start = Date.now();
    button.textContent = '■ Fin espera';
    time.hidden = reset.hidden = false;
    timer = window.setInterval(tick, 1000);
    tick();
  });
  reset.addEventListener('click', () => {
    start = Date.now();
    tick();
  });
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text: string, className?: string) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
