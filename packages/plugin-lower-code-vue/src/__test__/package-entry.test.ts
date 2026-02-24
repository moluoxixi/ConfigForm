import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * plugin-lower-code-vue 包入口契约测试。
 *
 * 目标：保证包入口文件、导出声明与 package 元数据保持一致。
 * 这类测试可作为每个包的发布前基础回归保障。
 */
describe('plugin-lower-code-vue entry contract', () => {
  /**
   * 入口文件必须存在，避免发布后出现引入路径失效。
   */
  it('has source entry file', () => {
    const entryUrl = new URL('../index.ts', import.meta.url)
    const source = readFileSync(entryUrl, 'utf8')
    expect(source.length).toBeGreaterThan(0)
  })

  /**
   * 入口文件需包含 export 关键字，确保对外 API 可用。
   */
  it('contains export declarations', () => {
    const entryUrl = new URL('../index.ts', import.meta.url)
    const source = readFileSync(entryUrl, 'utf8')
    expect(/\bexport\b/.test(source)).toBe(true)
  })

  /**
   * 入口源码需包含 JSDoc 块注释，确保可维护性信息可见。
   */
  it('contains jsdoc comments in entry source', () => {
    const entryUrl = new URL('../index.ts', import.meta.url)
    const source = readFileSync(entryUrl, 'utf8')
    expect(/\/\*\*[\s\S]*?\*\//.test(source)).toBe(true)
  })

  /**
   * package.json 的 main/types 字段应与入口语义保持一致。
   */
  it('keeps package metadata aligned with entry', () => {
    const pkgUrl = new URL('../../package.json', import.meta.url)
    const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8')) as { main?: string, types?: string }

    expect(typeof pkg.main).toBe('string')
    expect(typeof pkg.types).toBe('string')
    expect(pkg.main?.includes('index')).toBe(true)
    expect(pkg.types?.includes('index')).toBe(true)
  })
})
