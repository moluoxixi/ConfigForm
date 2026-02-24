import type { ReactiveAdapter } from '../reactive'
import { beforeAll, describe, expect, it } from 'vitest'
import { createForm } from '../createForm'
import { resetReactiveAdapter, setReactiveAdapter } from '../reactive'
import {
  createDecoratorRenderContract,
  createFieldInteractionContract,
  createFieldRenderContract,
} from './field-render'

/**
 * 契约层测试专用响应式适配器。
 * 该实现只保留最小行为，确保测试聚焦在 contract 逻辑本身，
 * 不被真实响应式框架实现细节干扰。
 */
const testAdapter: ReactiveAdapter = {
  name: 'test',
  /** 直接返回输入值，模拟 observable 包装行为。 */
  observable: target => target,
  /** 直接返回输入值，模拟 shallowObservable 包装行为。 */
  shallowObservable: target => target,
  /**
   * 返回一个带 value getter 的对象，模拟 computed 读取语义。
   * 每次读取 value 时都会重新执行 getter。
   */
  computed: getter => ({
    get value() {
      return getter()
    },
  }),
  /** 立即执行副作用并返回空 disposer。 */
  autorun: (effect) => {
    effect()
    return () => {}
  },
  /**
   * 先执行 track，再把计算值作为新旧值同时传给 effect。
   * 这里只用于满足测试契约，不模拟复杂差分逻辑。
   */
  reaction: (track, effect) => {
    const value = track()
    effect(value, value)
    return () => {}
  },
  /** 批处理在该测试实现中退化为同步执行。 */
  batch: fn => fn(),
  /** action 在测试中仅返回原函数。 */
  action: fn => fn,
  /** makeObservable 在测试中不做改写。 */
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

    ;(field as any).errors = [{ path: field.path, message: '必填', type: 'error' }]

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
