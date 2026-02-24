import { describe, expect, it, vi } from 'vitest'
import { mobxAdapter } from '../src/index.ts'

describe('reactive-react mobxAdapter', () => {
  it('tracks reaction updates', () => {
    const state = mobxAdapter.observable({ count: 0 })
    const values = []

    const dispose = mobxAdapter.reaction(
      () => state.count,
      value => values.push(value),
      { fireImmediately: true },
    )

    const update = mobxAdapter.action(() => {
      state.count = 1
      state.count = 2
    })
    update()
    dispose()

    expect(values).toEqual([0, 2])
  })

  it('computes derived values', () => {
    const state = mobxAdapter.observable({ count: 2 })
    const doubled = mobxAdapter.computed(() => state.count * 2)

    expect(doubled.value).toBe(4)
  })

  it('supports debounced reaction updates', () => {
    vi.useFakeTimers()
    const state = mobxAdapter.observable({ count: 0 })
    const values: number[] = []

    const dispose = mobxAdapter.reaction(
      () => state.count,
      value => values.push(value),
      { debounce: 30 },
    )

    const update = mobxAdapter.action(() => {
      state.count = 1
      state.count = 2
    })
    update()

    vi.advanceTimersByTime(29)
    expect(values).toEqual([])

    vi.advanceTimersByTime(1)
    expect(values).toEqual([2])

    dispose()
    vi.useRealTimers()
  })

  it('makes class instances observable with bound methods', () => {
    class Counter {
      count = 1

      get doubled() {
        return this.count * 2
      }

      increase() {
        this.count += 1
      }
    }

    const counter = mobxAdapter.makeObservable(new Counter())
    const detachedIncrease = counter.increase
    detachedIncrease()

    expect(counter.count).toBe(2)
    expect(counter.doubled).toBe(4)
  })
})
