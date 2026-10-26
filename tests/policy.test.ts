import { describe, expect, it } from 'vitest';
import { DEFAULT_POLICY, mergePolicy } from '../src/core/policy';

describe('mergePolicy', () => {
  it('aplica valores válidos', () => {
    const p = mergePolicy(DEFAULT_POLICY, {
      companyName: 'ACME Interpreting',
      privacy: { inactivityClearMinutes: 2, maskIdentifiers: true },
      models: { source: 'local' },
    });
    expect(p.companyName).toBe('ACME Interpreting');
    expect(p.privacy.inactivityClearMinutes).toBe(2);
    expect(p.privacy.maskIdentifiers).toBe(true);
    expect(p.privacy.clearOnCallEnd).toBe(true);
    expect(p.models.source).toBe('local');
  });

  it('ignora claves desconocidas y tipos incorrectos', () => {
    const p = mergePolicy(DEFAULT_POLICY, {
      privacy: { clearOnCallEnd: 'no', allowCopy: 1, uploadTo: 'https://x' },
      models: { source: 'cloud' },
      network: { allowedOrigins: 'https://evil.example' },
      acknowledgments: [1, 2],
    });
    expect(p.privacy.clearOnCallEnd).toBe(true);
    expect(p.privacy.allowCopy).toBe(false);
    expect('uploadTo' in p.privacy).toBe(false);
    expect(p.models.source).toBe('remote');
    expect(p.network.allowedOrigins).toEqual(DEFAULT_POLICY.network.allowedOrigins);
    expect(p.acknowledgments).toEqual(DEFAULT_POLICY.acknowledgments);
  });

  it('no modifica la política por defecto', () => {
    mergePolicy(DEFAULT_POLICY, { privacy: { allowCopy: true } });
    expect(DEFAULT_POLICY.privacy.allowCopy).toBe(false);
  });
});
