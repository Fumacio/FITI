/**
 * Bloquea en tiempo de ejecución cualquier conexión de red a un origen que no
 * esté en la lista permitida por la política. Se instala tanto en la página
 * como en el worker de modelos, de modo que ni el audio ni el texto puedan
 * enviarse a un servicio externo aunque una dependencia lo intente.
 */
export function isAllowedUrl(url: string, allowedOrigins: string[], selfOrigin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url, selfOrigin);
  } catch {
    return false;
  }
  if (parsed.protocol === 'blob:' || parsed.protocol === 'data:') return true;
  if (parsed.origin === selfOrigin) return true;
  return allowedOrigins.includes(parsed.origin);
}

export class BlockedRequestError extends Error {
  constructor(url: string) {
    super(`Conexión bloqueada por la política de la empresa: ${url}`);
    this.name = 'BlockedRequestError';
  }
}

type GlobalWithNetwork = typeof globalThis & {
  XMLHttpRequest?: typeof XMLHttpRequest;
  WebSocket?: typeof WebSocket;
  EventSource?: typeof EventSource;
  navigator?: Navigator;
};

export function installNetworkGuard(
  allowedOrigins: string[],
  onBlocked: (url: string) => void = () => {},
  scope: GlobalWithNetwork = globalThis,
): void {
  const selfOrigin = scope.location?.origin ?? 'null';
  const check = (url: string) => {
    if (isAllowedUrl(url, allowedOrigins, selfOrigin)) return;
    onBlocked(url);
    throw new BlockedRequestError(url);
  };

  const originalFetch = scope.fetch.bind(scope);
  scope.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    try {
      check(url);
    } catch (err) {
      return Promise.reject(err);
    }
    return originalFetch(input, init);
  };

  const Xhr = scope.XMLHttpRequest;
  if (Xhr) {
    const open = Xhr.prototype.open;
    Xhr.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
      check(String(url));
      return (open as (...a: unknown[]) => void).call(this, method, url, ...rest);
    } as typeof open;
  }

  for (const key of ['WebSocket', 'EventSource'] as const) {
    const Original = scope[key];
    if (!Original) continue;
    // Solo se permiten si apuntan a un origen autorizado.
    const Guarded = function (this: unknown, url: string | URL, ...rest: unknown[]) {
      check(String(url).replace(/^ws/, 'http'));
      return new (Original as new (...a: unknown[]) => unknown)(url, ...rest);
    } as unknown as typeof Original;
    Guarded.prototype = Original.prototype;
    (scope as Record<string, unknown>)[key] = Guarded;
  }

  if (scope.navigator && typeof scope.navigator.sendBeacon === 'function') {
    scope.navigator.sendBeacon = () => false;
  }
}
