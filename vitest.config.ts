import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/payfast-adapter/__tests__/**/*.test.ts']
  }
})
