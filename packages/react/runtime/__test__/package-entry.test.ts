import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createRegistry,
  createRegistryState,
  getComponent,
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerComponent,
  registerComponentToRegistry,
  registerFieldComponents,
  resetRegistry,
  subscribeRegistryChange,
} from '../src/registry.ts'

describe('react registry', () => {
  beforeEach(() => {
    resetRegistry()
  })

  it('registers and resolves global component', () => {
    const Input = () => null
    registerComponent('Input', Input)

    expect(getComponent('Input')).toBe(Input)
  })

  it('creates isolated registry with field decorators', () => {
    const Field = () => null
    const FormItem = () => null
    const registry = createRegistry(({ fieldComponents }) => {
      fieldComponents({ Field }, { name: 'FormItem', component: FormItem })
    })

    expect(registry.components.get('Field')).toBe(Field)
    expect(registry.defaultDecorators.get('Field')).toBe('FormItem')
  })

  it('registers readPretty mapping and default decorator for fields', () => {
    const Input = () => null
    const FormItem = () => null
    const PreviewInput = () => null

    registerFieldComponents(
      { Input },
      { name: 'FormItem', component: FormItem },
      undefined,
      { Input: PreviewInput },
    )

    expect(getComponent('Input')).toBe(Input)
    expect(getDecorator('FormItem')).toBe(FormItem)
    expect(getDefaultDecorator('Input')).toBe('FormItem')
    expect(getReadPrettyComponent('Input')).toBe(PreviewInput)
  })

  it('notifies subscribers on isolated registry updates', () => {
    const registry = createRegistryState()
    const listener = vi.fn()
    const unsubscribe = subscribeRegistryChange(registry, listener)

    registerComponentToRegistry(registry, 'Input', () => null)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    registerComponentToRegistry(registry, 'Select', () => null)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
