import { describe, expect, it } from 'vitest'

describe('plugin-history ssr import', () => {
  it('can import plugin module in node runtime', async () => {
    const mod = await import('../src/plugin.ts')
    expect(typeof mod.historyPlugin).toBe('function')
  })
})
