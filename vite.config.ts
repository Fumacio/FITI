import { defineConfig } from 'vite';

// Cabeceras de seguridad para la versión de producción (`npm run preview`).
// Replíquelas en el servidor real (nginx, IIS, etc.). Al ir en la cabecera HTTP
// también se aplican al worker de modelos, no solo a la página.
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
    "worker-src 'self' blob:",
    "connect-src 'self' https://huggingface.co https://*.huggingface.co https://*.hf.co https://cdn.jsdelivr.net",
    "img-src 'self' data:",
    "style-src 'self'",
    "media-src 'self' blob:",
    "frame-ancestors 'none'",
    "form-action 'none'",
  ].join('; '),
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(), geolocation=(), display-capture=(self), microphone=(self)',
  'Cache-Control': 'no-store',
};

export default defineConfig({
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  preview: { headers: securityHeaders },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as Parameters<typeof defineConfig>[0]);
