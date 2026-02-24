import { defineConfig } from 'vitest/config'

/**
 * Monorepo 包级测试配置。
 *
 * 该配置用于统一执行各个 package 下 `src/__test__` 目录的测试用例，
 * 作为“包入口契约”与基础发布面回归检查。
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/*/src/__test__/**/*.test.ts',
    ],
  },
})
