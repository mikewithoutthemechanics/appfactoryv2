import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'stub-payfast-adapter',
      resolveId(source) {
        if (source.includes('payfast-adapter')) {
          return source;
        }
        return null;
      },
      load(id) {
        if (id.includes('payfast-adapter')) {
          return `
export function buildPayFastURL(opts) {
  const params = new URLSearchParams();
  params.set('merchant_id', opts.merchantId || '');
  params.set('merchant_key', opts.merchantKey || '');
  params.set('return_url', opts.returnURL || '');
  params.set('notify_url', opts.notifyURL || '');
  params.set('amount', (opts.amount || 0).toFixed(2));
  params.set('item_name', opts.itemName || '');
  if (opts.customStr1) params.set('custom_str1', opts.customStr1);
  return 'https://www.payfast.co.za/eng/process?' + params.toString();
}
export default { buildPayFastURL };
`;
        }
        return null;
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
