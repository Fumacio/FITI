import { describe, expect, it } from 'vitest';
import { Segmenter, type Segment } from '../src/audio/segmenter';

const SR = 16000;
const tone = (ms: number, amp = 0.2) =>
  Float32Array.from({ length: (SR * ms) / 1000 }, (_, i) => amp * Math.sin((2 * Math.PI * 220 * i) / SR));
const silence = (ms: number) => new Float32Array((SR * ms) / 1000);

function run(chunks: Float32Array[], opts = {}) {
  const out: Segment[] = [];
  const s = new Segmenter((seg) => out.push(seg), opts);
  // Bloques de 100 ms como los que envía el AudioWorklet.
  for (const c of chunks) for (let i = 0; i < c.length; i += 1600) s.push(c.subarray(i, i + 1600));
  return { out, s };
}

describe('Segmenter', () => {
  it('emite un segmento por turno separado por silencio', () => {
    const { out } = run([silence(500), tone(1500), silence(1000), tone(800), silence(1000)]);
    expect(out).toHaveLength(2);
    expect(out[0].durationSec).toBeGreaterThan(1.4);
    expect(out[0].durationSec).toBeLessThan(2.2);
  });

  it('ignora ruidos demasiado cortos', () => {
    const { out } = run([silence(500), tone(150), silence(1500)]);
    expect(out).toHaveLength(0);
  });

  it('corta los turnos que superan la duración máxima', () => {
    const { out } = run([tone(5000)], { maxSegmentMs: 2000 });
    expect(out.length).toBeGreaterThanOrEqual(2);
    for (const seg of out) expect(seg.durationSec).toBeLessThanOrEqual(2.3);
  });

  it('flush emite el turno en curso y reset lo descarta', () => {
    const a = run([silence(300), tone(1000)]);
    a.s.flush();
    expect(a.out).toHaveLength(1);

    const b = run([silence(300), tone(1000)]);
    b.s.reset();
    b.s.flush();
    expect(b.out).toHaveLength(0);
  });
});
