import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'stub-payfast-adapter',
      resolveId(source, _importer, _options) {
        if (source.includes('payfast-adapter')) return source;
        return null;
      },
      load(_id) {
        return `
          const buildPayFastURL = () => '';
          export { buildPayFastURL };
        `;
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
