import { describe, expect, it } from 'vitest'

describe('plugin-print ssr import', () => {
  it('can import plugin module in node runtime', async () => {
    const mod = await import('../src/plugin.ts')
    expect(typeof mod.printPlugin).toBe('function')
  })
})
