import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fillPlaceholders, holdStage, parseProtocol } from '../src/protocol';

const example = parseProtocol(JSON.parse(readFileSync('public/protocol.example.json', 'utf8')));
const min = 60_000;

describe('protocolo', () => {
  it('interpreta el archivo de ejemplo', () => {
    expect(example.sections.length).toBeGreaterThan(0);
    expect(example.hold.maxMinutes).toBe(15);
  });

  it('valores inválidos usan los predeterminados', () => {
    const p = parseProtocol({ hold: { maxMinutes: -1 }, sections: [{ scripts: [{ to: 'x', en: 'Hi' }] }] });
    expect(p.hold.maxMinutes).toBe(15);
    expect(p.sections[0].scripts[0].to).toBe('client');
  });

  it('rellena los datos del intérprete', () => {
    const p = { ...example, interpreter: { name: 'Ana', id: '1234', language: 'Spanish' } };
    expect(fillPlaceholders('I am {name}, ID {id}, your {language} interpreter', p)).toBe(
      'I am Ana, ID 1234, your Spanish interpreter',
    );
    expect(fillPlaceholders('{name}', example)).toBe('(nombre)');
  });

  it('avisa de refrescar la línea cada 10 min y de fin de espera a los 15', () => {
    expect(holdStage(5 * min, example).stage).toBe('ok');
    expect(holdStage(10 * min + 5000, example).stage).toBe('refresh');
    expect(holdStage(11.5 * min, example).stage).toBe('ok');
    expect(holdStage(15 * min, example).stage).toBe('expired');
  });
});
