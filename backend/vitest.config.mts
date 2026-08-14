import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env before vitest starts so DATABASE_URL / TEST_DATABASE_URL are
// available without needing to prefix `npm test` with env vars manually.
config({ path: resolve(import.meta.dirname, '.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Run test files sequentially to avoid concurrent DB access (Vitest 4+)
    singleFork: true,
  },
});
