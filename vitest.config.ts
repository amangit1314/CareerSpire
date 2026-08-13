import { defineConfig } from 'vitest/config';
import path from 'path';

// No vitest config existed before this — the `@/*` alias (defined in
// tsconfig.json for the app/build) was never wired into Vitest's resolver.
// Tests that referenced `@/...` only "passed" because vi.mock() intercepts
// by specifier text before real resolution happens; any real (non-mocked)
// `@/` import would have failed. This makes the alias actually work.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
