import { loadPolicy, type CompanyPolicy } from './core/policy';
import { installNetworkGuard } from './core/networkGuard';
import { maskIdentifiers } from './core/redact';
import { Segmenter } from './audio/segmenter';
import { listInputDevices, startCapture, type CaptureHandle, type CaptureSource } from './audio/capture';
import type { FromWorker, Lang, ToWorker } from './core/messages';

interface Entry {
  id: number;
  lang?: Lang;
  text: string;
  translation: string;
  pending: boolean;
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const ui = {
  source: $<HTMLSelectElement>('source'),
  start: $<HTMLButtonElement>('start'),
  end: $<HTMLButtonElement>('end'),
  state: $('state'),
  level: $('level'),
  progress: $('progress'),
  rows: $('rows'),
  empty: $('empty'),
  queue: $('queue'),
  mtNotice: $('mt-notice'),
  ack: $<HTMLDialogElement>('ack'),
  ackList: $('ack-list'),
  ackOk: $<HTMLButtonElement>('ack-ok'),
  company: $('company'),
};

// La transcripción solo existe en esta variable: nunca se escribe en disco,
// localStorage, IndexedDB ni se envía por red.
let entries: Entry[] = [];
let nextId = 1;
let capture: CaptureHandle | null = null;
let inactivityTimer: number | undefined;
let policy: CompanyPolicy;

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const send = (msg: ToWorker, transfer: Transferable[] = []) => worker.postMessage(msg, transfer);

const segmenter = new Segmenter(({ audio, durationSec }) => {
  const id = nextId++;
  entries.push({ id, text: '', translation: '', pending: true });
  trimEntries();
  render();
  send({ type: 'segment', id, audio, durationSec }, [audio.buffer]);
});

async function main() {
  policy = await loadPolicy(`${import.meta.env.BASE_URL}policy.json`);
  const allowed = policy.models.source === 'local' ? [] : policy.network.allowedOrigins;
  installNetworkGuard(allowed, (url) => console.warn('Bloqueado:', url));
  applyPrivacyProtections();
  ui.mtNotice.textContent = `· ${policy.display.machineTranslationNotice}`;

  worker.onmessage = (e: MessageEvent<FromWorker>) => onWorkerMessage(e.data);
  send({ type: 'init', policy });
  void populateDevices();

  ui.start.addEventListener('click', () => void requestStart());
  ui.end.addEventListener('click', endCall);
}

function onWorkerMessage(msg: FromWorker) {
  switch (msg.type) {
    case 'progress':
      ui.progress.hidden = false;
      ui.progress.textContent = `Descargando modelo (${msg.file}): ${Math.round(msg.progress)} %`;
      break;
    case 'ready':
      ui.progress.hidden = true;
      ui.start.disabled = false;
      ui.start.textContent = 'Iniciar llamada';
      setState(`Listo (${msg.device === 'webgpu' ? 'GPU' : 'CPU'})`);
      break;
    case 'result': {
      const entry = entries.find((x) => x.id === msg.id);
      if (!entry) return; // la pantalla se borró mientras se procesaba
      const show = policy.privacy.maskIdentifiers ? maskIdentifiers : (s: string) => s;
      entry.lang = msg.lang;
      entry.text = show(msg.text);
      entry.translation = show(msg.translation);
      entry.pending = false;
      render();
      resetInactivityTimer();
      break;
    }
    case 'skipped':
      entries = entries.filter((x) => x.id !== msg.id);
      render();
      break;
    case 'blocked':
      console.warn('Bloqueado en worker:', msg.url);
      break;
    case 'error':
      setState('Error');
      if (ui.start.disabled && !capture) ui.start.textContent = 'Modelos no disponibles';
      ui.progress.hidden = false;
      ui.progress.textContent = `Error: ${msg.message}`;
      break;
  }
}

async function populateDevices() {
  try {
    const devices = await listInputDevices();
    devices.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = `device:${d.deviceId}`;
      opt.textContent = d.label || `Entrada de audio ${i + 1}`;
      ui.source.append(opt);
    });
  } catch {
    // Sin permiso para listar dispositivos: queda solo la opción de sistema.
  }
}

async function requestStart() {
  if (!(await confirmAcknowledgments())) return;
  const value = ui.source.value;
  const source: CaptureSource = value.startsWith('device:')
    ? { kind: 'device', deviceId: value.slice('device:'.length) }
    : { kind: 'system' };

  try {
    capture = await startCapture(source, (chunk) => segmenter.push(chunk), endCall);
  } catch (err) {
    setState('Sin audio');
    alert(err instanceof Error ? err.message : String(err));
    return;
  }
  ui.start.disabled = true;
  ui.end.disabled = false;
  ui.source.disabled = true;
  setState('En llamada', true);
  resetInactivityTimer();
  meterLoop();
}

function endCall() {
  capture?.stop();
  capture = null;
  segmenter.reset();
  if (policy.privacy.clearOnCallEnd) clearScreen();
  ui.start.disabled = false;
  ui.end.disabled = true;
  ui.source.disabled = false;
  ui.level.style.width = '0';
  setState('Inactivo');
}

function clearScreen() {
  entries = [];
  render();
}

/** Pide confirmar la política antes de cada llamada. No se recuerda la respuesta. */
function confirmAcknowledgments(): Promise<boolean> {
  ui.company.textContent = policy.companyName;
  ui.ackList.replaceChildren(
    ...policy.acknowledgments.map((text) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      label.append(box, document.createTextNode(text));
      li.append(label);
      return li;
    }),
  );
  const boxes = [...ui.ackList.querySelectorAll('input')];
  const update = () => (ui.ackOk.disabled = !boxes.every((b) => b.checked));
  boxes.forEach((b) => b.addEventListener('change', update));
  update();

  return new Promise((resolve) => {
    ui.ack.addEventListener('close', () => resolve(ui.ack.returnValue === 'ok'), { once: true });
    ui.ack.returnValue = '';
    ui.ack.showModal();
  });
}

function applyPrivacyProtections() {
  const p = policy.privacy;
  if (!p.allowCopy) {
    document.body.classList.add('no-copy');
    for (const evt of ['copy', 'cut', 'contextmenu', 'dragstart'] as const) {
      ui.rows.addEventListener(evt, (e) => e.preventDefault());
    }
  }
  if (p.blurWhenUnfocused) {
    const blur = (on: boolean) => document.body.classList.toggle('privacy-blur', on);
    window.addEventListener('blur', () => blur(true));
    window.addEventListener('focus', () => blur(false));
    document.addEventListener('visibilitychange', () => blur(document.hidden));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !ui.ack.open) clearScreen();
  });
  window.addEventListener('pagehide', () => {
    capture?.stop();
    clearScreen();
  });
}

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  const minutes = policy.privacy.inactivityClearMinutes;
  if (minutes > 0) inactivityTimer = window.setTimeout(clearScreen, minutes * 60_000);
}

function trimEntries() {
  const max = Math.max(1, policy.privacy.maxEntriesOnScreen);
  if (entries.length > max) entries = entries.slice(-max);
}

function render() {
  const lastDone = [...entries].reverse().find((e) => !e.pending);
  ui.rows.replaceChildren(
    ...entries.map((entry) => {
      const row = document.createElement('div');
      row.className = `row ${entry.lang ?? ''}`;
      if (entry.pending) row.classList.add('pending');
      if (entry === lastDone) row.classList.add('latest');

      const speaker = cell('speaker', entry.lang ? speakerLabel(entry.lang) : '');
      const original = cell('original', entry.pending ? 'Transcribiendo…' : entry.text);
      const translation = cell('translation', entry.translation);
      row.append(speaker, original, translation);
      return row;
    }),
  );
  ui.empty.hidden = entries.length > 0;
  const pending = entries.filter((e) => e.pending).length;
  ui.queue.textContent = pending > 1 ? `${pending} intervenciones en cola` : '';
  window.scrollTo({ top: document.body.scrollHeight });
}

function cell(className: string, text: string) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text; // textContent: nunca se interpreta como HTML
  return div;
}

function speakerLabel(lang: Lang) {
  return lang === 'en' ? policy.display.englishSpeakerLabel : policy.display.spanishSpeakerLabel;
}

function setState(text: string, live = false) {
  ui.state.textContent = text;
  ui.state.classList.toggle('live', live);
}

function meterLoop() {
  if (!capture) return;
  const pct = Math.min(100, segmenter.level * 600);
  ui.level.style.width = `${pct}%`;
  requestAnimationFrame(meterLoop);
}

void main();
