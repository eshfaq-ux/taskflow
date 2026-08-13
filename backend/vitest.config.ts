import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Run test files sequentially to avoid concurrent DB access
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
