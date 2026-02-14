import type { ReactiveAdapter } from '../reactive'
import { beforeAll, describe, expect, it } from 'vitest'
import { createForm } from '../createForm'
import { resetReactiveAdapter, setReactiveAdapter } from '../reactive'
import {
  createDecoratorRenderContract,
  createFieldInteractionContract,
  createFieldRenderContract,
} from './field-render'

const testAdapter: ReactiveAdapter = {
  name: 'test',
  observable: target => target,
  shallowObservable: target => target,
  computed: getter => ({ get value() { return getter() } }),
  autorun: (effect) => {
    effect()
    return () => {}
  },
  reaction: (track, effect) => {
    const value = track()
    effect(value, value)
    return () => {}
  },
  batch: fn => fn(),
  action: fn => fn,
  makeObservable: target => target,
}

describe('field-render contracts', () => {
  beforeAll(() => {
    resetReactiveAdapter()
    setReactiveAdapter(testAdapter)
  })

  it('creates decorator contract with deterministic error metadata', () => {
    const form = createForm({
      labelPosition: 'left',
      labelWidth: 160,
    })
    const field = form.createField({
      name: 'username',
      label: '用户名',
      required: true,
      component: 'Input',
    })

    field.errors = [{ path: field.path, message: '必填', type: 'error' }]

    const contract = createDecoratorRenderContract(field, form)
    expect(contract.fieldPath).toBe('username')
    expect(contract.hasErrors).toBe(true)
    expect(contract.label).toBe('用户名')
    expect(contract.labelPosition).toBe('left')
    expect(contract.labelWidth).toBe(160)
  })

  it('creates render/interaction contract and drives field state', () => {
    const form = createForm()
    const field = form.createField({
      name: 'email',
      component: 'Input',
      ariaLabel: '邮箱',
      ariaDescribedBy: 'email-help',
      ariaLabelledBy: 'email-label',
    })

    const renderContract = createFieldRenderContract(field)
    expect(renderContract.ariaProps['aria-label']).toBe('邮箱')
    expect(renderContract.ariaProps['aria-describedby']).toBe('email-help')
    expect(renderContract.ariaProps['aria-labelledby']).toBe('email-label')

    const interactions = createFieldInteractionContract(field)
    interactions.onInput('foo@example.com')
    expect(field.value).toBe('foo@example.com')

    interactions.onFocus()
    expect(field.active).toBe(true)
    interactions.onBlur()
    expect(field.active).toBe(false)
  })
})
