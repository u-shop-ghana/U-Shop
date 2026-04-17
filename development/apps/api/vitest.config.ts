import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/integration/setup.ts'],
    server: {
      deps: {
        inline: ['isomorphic-dompurify', 'jsdom', '@asamuzakjp/css-color'],
      },
    },
  },
});
