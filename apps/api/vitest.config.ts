import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    hookTimeout: 20000,
    testTimeout: 20000,
    // Route/DB-backed tests need DATABASE_URL, same as `npm run dev` (which
    // is invoked with `--env-file=.env`) — load the same file here.
    env: {
      NODE_ENV: 'test',
    },
    setupFiles: ['./vitest.setup.ts'],
  },
})
