import { describe, expect, it, vi } from 'vitest'
import { vueAdapter } from '../src/index.ts'

describe('reactive-vue vueAdapter', () => {
  it('tracks reaction updates', () => {
    const state = vueAdapter.observable({ count: 0 })
    const values = []

    const dispose = vueAdapter.reaction(
      () => state.count,
      value => values.push(value),
      { fireImmediately: true },
    )

    state.count = 1
    state.count = 2
    dispose()

    expect(values).toEqual([0, 1, 2])
  })

  it('computes derived values', () => {
    const state = vueAdapter.observable({ count: 3 })
    const doubled = vueAdapter.computed(() => state.count * 2)

    expect(doubled.value).toBe(6)
  })

  it('supports debounced reactions', () => {
    vi.useFakeTimers()
    const state = vueAdapter.observable({ count: 0 })
    const values: number[] = []

    const dispose = vueAdapter.reaction(
      () => state.count,
      value => values.push(value),
      { debounce: 20 },
    )

    state.count = 1
    state.count = 2

    vi.advanceTimersByTime(19)
    expect(values).toEqual([])

    vi.advanceTimersByTime(1)
    expect(values).toEqual([2])

    dispose()
    vi.useRealTimers()
  })

  it('returns reactive proxy from makeObservable', () => {
    const source = { count: 1 }
    const proxy = vueAdapter.makeObservable(source)

    proxy.count = 2
    expect(source.count).toBe(2)
    expect(proxy).not.toBe(source)
  })
})
