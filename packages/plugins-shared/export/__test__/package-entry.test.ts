import { FormLifeCycle } from '@moluoxixi/core'
import { describe, expect, it, vi } from 'vitest'
import { exportPlugin } from '../src/index.ts'

function createMockForm(values: Record<string, unknown>) {
  const valueListeners = new Set<() => void>()
  const eventListeners = new Map<string, Set<() => void>>()

  const form: any = {
    values,
    onValuesChange(listener: () => void) {
      valueListeners.add(listener)
      return () => {
        valueListeners.delete(listener)
      }
    },
    on(event: string, listener: () => void) {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set())
      }
      eventListeners.get(event)!.add(listener)
      return () => {
        eventListeners.get(event)?.delete(listener)
      }
    },
  }

  return {
    form,
    emitValuesChange() {
      for (const listener of valueListeners) {
        listener()
      }
    },
    emit(event: string) {
      const listeners = eventListeners.get(event)
      if (!listeners) {
        return
      }
      for (const listener of listeners) {
        listener()
      }
    },
  }
}

describe('plugin-export', () => {
  it('exports data and delegates download to adapter', async () => {
    const download = vi.fn(async () => {})
    const { form } = createMockForm({ name: 'Alice', _internal: true })

    const installed = exportPlugin({
      filenameBase: () => 'demo-config',
      excludePrefixes: ['_'],
      adapters: { download },
    }).install(form)

    expect(installed.api.getExportData()).toEqual({ name: 'Alice' })
    expect(installed.api.getExportData({ excludePrefixes: [] })).toEqual({
      name: 'Alice',
      _internal: true,
    })
    expect(installed.api.exportJSON({ space: 0 })).toBe('{"name":"Alice"}')

    await installed.api.downloadJSON({ filename: 'custom.json' })

    expect(download).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'custom.json',
      mimeType: 'application/json;charset=utf-8',
    }))
  })

  it('pushes export preview updates on values and lifecycle changes', async () => {
    const { form, emitValuesChange, emit } = createMockForm({
      name: 'Alice',
      _internal: true,
    })
    const installed = exportPlugin({
      excludePrefixes: ['_'],
      jsonSpace: 2,
    }).install(form)

    const listener = vi.fn()
    const unsubscribe = installed.api.subscribeExportPreview(listener, { jsonSpace: 0 })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toEqual({
      data: { name: 'Alice' },
      json: '{"name":"Alice"}',
    })

    form.values = { name: 'Bob', _internal: 'skip' }
    emitValuesChange()
    emitValuesChange()
    await Promise.resolve()

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[1][0].data).toEqual({ name: 'Bob' })

    emit(FormLifeCycle.ON_FORM_RESET)
    await Promise.resolve()
    expect(listener).toHaveBeenCalledTimes(3)

    expect(typeof form.getExportData).toBe('function')
    installed.dispose?.()
    expect(form.getExportData).toBeUndefined()

    unsubscribe()
  })
})
