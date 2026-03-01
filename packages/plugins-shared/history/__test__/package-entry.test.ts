import type { ReactiveAdapter } from '@moluoxixi/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createForm, resetReactiveAdapter, setReactiveAdapter } from '@moluoxixi/core'
import type { HistoryPluginAPI } from '../src/types'
import { historyPlugin } from '../src/plugin'

interface UserFormValues {
  name: string
  age: number
}

const testAdapter: ReactiveAdapter = {
  name: 'test',
  observable: target => target,
  shallowObservable: target => target,
  computed: getter => ({
    get value() {
      return getter()
    },
  }),
  autorun: (effect) => {
    effect()
    return () => {}
  },
  reaction: (track, effect, options) => {
    const value = track()
    if (options?.fireImmediately) {
      effect(value, value)
    }
    return () => {}
  },
  batch: fn => fn(),
  action: fn => fn,
  makeObservable: target => target,
}

describe('plugin-history', () => {
  beforeEach(() => {
    setReactiveAdapter(testAdapter)
  })

  afterEach(() => {
    resetReactiveAdapter()
  })

  it('supports save/undo/redo flow', () => {
    const form = createForm<UserFormValues>({
      initialValues: {
        name: 'Alice',
        age: 18,
      },
      plugins: [historyPlugin()],
    })

    const history = form.getPlugin<HistoryPluginAPI>('history')!
    form.setFieldValue('name', 'Bob')
    expect(history.save('input', 'change name')).toBe(true)

    expect(history.canUndo).toBe(true)
    expect(history.undo()).toBe(true)
    expect(form.values.name).toBe('Alice')
    expect(history.redo()).toBe(true)
    expect(form.values.name).toBe('Bob')
  })

  it('supports batch and clear', () => {
    const form = createForm({
      initialValues: { a: 1, b: 2 },
      plugins: [historyPlugin()],
    })

    const history = form.getPlugin<HistoryPluginAPI>('history')!
    history.batch(() => {
      form.setFieldValue('a', 10)
      form.setFieldValue('b', 20)
    }, 'batch update')

    expect(history.undoCount).toBe(1)
    expect(history.undo()).toBe(true)
    expect(form.values).toEqual({ a: 1, b: 2 })

    history.clear()
    expect(history.undoCount).toBe(0)
    expect(history.redoCount).toBe(0)
  })

  it('supports goto and onChange', () => {
    const form = createForm({
      initialValues: { title: 'v1' },
      plugins: [historyPlugin()],
    })

    const history = form.getPlugin<HistoryPluginAPI>('history')!
    const onChange = vi.fn()
    const dispose = history.onChange(onChange)

    form.setFieldValue('title', 'v2')
    history.save('input')
    form.setFieldValue('title', 'v3')
    history.save('input')

    expect(history.goto(0)).toBe(true)
    expect(form.values.title).toBe('v1')
    expect(onChange).toHaveBeenCalled()

    dispose()
  })

  it('autoSave tracks value changes and reset events', () => {
    const form = createForm({
      initialValues: { x: 1 },
      plugins: [historyPlugin({ autoSave: true })],
    })

    const history = form.getPlugin<HistoryPluginAPI>('history')!
    form.setFieldValue('x', 2)
    expect(history.undoCount).toBe(1)

    form.reset()
    expect(history.records[history.records.length - 1].type).toBe('reset')
  })

  it('mounts and unmounts api on form instance', () => {
    const form: any = createForm({ initialValues: { n: 1 } })
    const installed = historyPlugin().install(form)

    expect(typeof form.history?.undo).toBe('function')

    installed.dispose?.()
    expect(form.history).toBeUndefined()
  })
})
