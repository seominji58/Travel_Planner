import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function securityMetaPlugin(): Plugin {
  let isServe = false;

  return {
    name: 'travel-planner-security-meta',
    configResolved(config) {
      isServe = config.command === 'serve';
    },
    transformIndexHtml() {
      const scriptSrc = isServe ? "'self' 'unsafe-inline'" : "'self'";
      const connectSrc = isServe ? "'self' ws: wss:" : "'self'";

      const csp = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
        "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
        "img-src 'self' data: https://*.tile.openstreetmap.org",
        `connect-src ${connectSrc}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

      return [
        {
          tag: 'meta',
          attrs: { name: 'referrer', content: 'no-referrer' },
          injectTo: 'head-prepend',
        },
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: csp },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), securityMetaPlugin()],
});
