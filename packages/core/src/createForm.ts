import type { FormConfig, FormInstance } from './types'
import { getReactiveAdapter } from '@moluoxixi/reactive'
import { Form } from './models/Form'

/**
 * 创建表单实例
 *
 * 核心流程：
 * 1. 创建 Form 原始实例
 * 2. 使 values / initialValues 成为深度响应式
 * 3. 使整个 Form 实例成为响应式（makeObservable）
 * 4. 返回响应式代理（调用者必须使用此返回值）
 *
 * @example
 * ```ts
 * const form = createForm({
 *   initialValues: { name: '', age: 0 },
 * });
 * ```
 */
export function createForm<
  Values extends Record<string, unknown> = Record<string, unknown>,
>(config: FormConfig<Values> = {}): FormInstance<Values> {
  const adapter = getReactiveAdapter()
  const form = new Form<Values>(config)

  /* 先让数据对象变为深度响应式 */
  form.values = adapter.observable(form.values)
  /**
   * initialValues 不使用 observable 包装。
   * 作为重置时的参考值，不需要响应式追踪。
   * 避免被 MobX 代理后，FormPath.setIn 意外扩展数组条目。
   */

  /* 让整个 Form 实例变为响应式，返回代理 */
  const reactiveForm = adapter.makeObservable(form)

  return reactiveForm as unknown as FormInstance<Values>
}
