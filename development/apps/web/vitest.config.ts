import { defineConfig } from 'vitest/config';

// ─── Web Vitest Configuration ───────────────────────────────────
// For now we only run unit tests on non-React utility logic.
// Component tests with @testing-library/react will require
// @vitejs/plugin-react once we add them in a future phase.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
});
