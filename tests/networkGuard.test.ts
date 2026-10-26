import { describe, expect, it, vi } from 'vitest';
import { BlockedRequestError, installNetworkGuard, isAllowedUrl } from '../src/core/networkGuard';

const SELF = 'http://localhost:5173';
const ALLOWED = ['https://huggingface.co'];

describe('isAllowedUrl', () => {
  it('permite el propio origen, blob: y orígenes de la lista', () => {
    expect(isAllowedUrl('/policy.json', ALLOWED, SELF)).toBe(true);
    expect(isAllowedUrl('blob:http://localhost:5173/abc', ALLOWED, SELF)).toBe(true);
    expect(isAllowedUrl('https://huggingface.co/x/resolve/main/config.json', ALLOWED, SELF)).toBe(true);
  });

  it('bloquea cualquier otro origen', () => {
    expect(isAllowedUrl('https://api.example.com/transcribe', ALLOWED, SELF)).toBe(false);
    expect(isAllowedUrl('https://huggingface.co.evil.com/', ALLOWED, SELF)).toBe(false);
  });
});

describe('installNetworkGuard', () => {
  it('rechaza fetch a orígenes no permitidos y deja pasar los permitidos', async () => {
    const realFetch = vi.fn(async () => new Response('ok'));
    const scope = { fetch: realFetch, location: { origin: SELF } } as unknown as typeof globalThis;
    const blocked: string[] = [];
    installNetworkGuard(ALLOWED, (u) => blocked.push(u), scope);

    await expect(scope.fetch('https://api.example.com/upload', { method: 'POST' })).rejects.toBeInstanceOf(
      BlockedRequestError,
    );
    expect(blocked).toEqual(['https://api.example.com/upload']);
    await scope.fetch('https://huggingface.co/model.onnx');
    expect(realFetch).toHaveBeenCalledTimes(1);
  });
});
