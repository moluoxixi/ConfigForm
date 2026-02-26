import { describe, expect, it, vi } from 'vitest'

import { printPlugin } from '../src/plugin.ts'

vi.mock('../src/browser', () => ({
  browserPrint: vi.fn(async () => {}),
}))

describe('plugin-print', () => {
  it('formats printable payload and restores pattern', async () => {
    const print = vi.fn(async () => {})
    const form: any = {
      pattern: 'editable',
      values: {
        name: 'Alice',
        _internal: 'skip',
      },
    }

    const installed = printPlugin({
      adapters: { print },
    }).install(form)

    await installed.api.print()

    const payload = print.mock.calls[0][0]
    expect(payload.values).toEqual({ name: 'Alice' })
    expect(payload.json).toContain('"name": "Alice"')
    expect(payload.text).toContain('name: Alice')
    expect(form.pattern).toBe('editable')

    expect(typeof form.print).toBe('function')
    installed.dispose?.()
    expect(form.print).toBeUndefined()
  })

  it('supports target resolution and pattern strategy options', async () => {
    const print = vi.fn(async () => {})
    const form: any = {
      pattern: 'editable',
      values: {
        name: 'Alice',
        _internal: 'skip',
      },
    }

    const installed = printPlugin({
      adapters: { print },
      print: {
        target: () => '#print-root',
        switchPattern: false,
        formatText: values => `fields:${Object.keys(values).join(',')}`,
      },
    }).install(form)

    await installed.api.print({
      excludePrefixes: ['_'],
      title: 'Order Form',
    })

    expect(print).toHaveBeenCalledTimes(1)
    expect(print.mock.calls[0][0]).toEqual(expect.objectContaining({
      title: 'Order Form',
      target: '#print-root',
      values: { name: 'Alice' },
      text: 'fields:name',
    }))
    expect(form.pattern).toBe('editable')

    await installed.api.print({
      switchPattern: true,
      restorePattern: false,
      previewPattern: 'preview',
    })
    expect(form.pattern).toBe('preview')
  })
})
