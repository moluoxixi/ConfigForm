import type { ReactiveAdapter } from '../src/reactive/types'
import { afterEach, describe, expect, it } from 'vitest'
import { createForm } from '../src/createForm'
import { resetReactiveAdapter, setReactiveAdapter } from '../src/reactive/registry'

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

describe('core createForm', () => {
  afterEach(() => {
    resetReactiveAdapter()
  })

  it('creates form instance and supports setValues', () => {
    setReactiveAdapter(testAdapter)

    const form = createForm({
      initialValues: {
        name: 'Alice',
      },
    })

    form.setValues({ age: 18 }, 'merge')

    expect(form.values).toMatchObject({
      name: 'Alice',
      age: 18,
    })
  })

  it('installs plugins by dependency and priority order', () => {
    setReactiveAdapter(testAdapter)

    const installedOrder: string[] = []
    createForm({
      plugins: [
        {
          name: 'plugin-b',
          dependencies: ['plugin-a'],
          install() {
            installedOrder.push('plugin-b')
            return { api: {} }
          },
        },
        {
          name: 'plugin-a',
          priority: 10,
          install() {
            installedOrder.push('plugin-a')
            return { api: {} }
          },
        },
        {
          name: 'plugin-c',
          priority: 1,
          install() {
            installedOrder.push('plugin-c')
            return { api: {} }
          },
        },
      ],
    })

    expect(installedOrder).toEqual(['plugin-c', 'plugin-a', 'plugin-b'])
  })

  it('throws on missing plugin dependency', () => {
    setReactiveAdapter(testAdapter)

    expect(() => {
      createForm({
        plugins: [
          {
            name: 'plugin-x',
            dependencies: ['missing-plugin'],
            install() {
              return { api: {} }
            },
          },
        ],
      })
    }).toThrow('依赖')
  })

  it('throws on duplicate plugin names', () => {
    setReactiveAdapter(testAdapter)

    expect(() => {
      createForm({
        plugins: [
          {
            name: 'dup-plugin',
            install() {
              return { api: {} }
            },
          },
          {
            name: 'dup-plugin',
            install() {
              return { api: {} }
            },
          },
        ],
      })
    }).toThrow('名称重复')
  })
})
