import type { Disposer } from '../shared'
import type { FieldInstance, FormInstance, VoidFieldInstance } from '../types'
import { getReactiveAdapter } from '../reactive'
import { FormPath } from '../shared'
import { FormLifeCycle } from '../events'

/**
 * Effects 工厂函数
 *
 * 提供命令式的字段监听 API，作为声明式 reactions 的补充。
 * 设计为独立函数（非 Form 方法），接收 form 参数，
 * 可在 FormConfig.effects 回调中使用。
 *
 * @example
 * ```ts
 * const form = createForm({
 *   effects: (form) => {
 *     onFieldValueChange(form, 'address.*', (field) => {
 *       console.log(`地址字段变化: ${field.path}`)
 *     })
 *     onFormReact(form, (form) => {
 *       form.setFieldState('summary', {
 *         value: `${form.values.firstName} ${form.values.lastName}`,
 *       })
 *     })
 *   },
 * })
 * ```
 */

/**
 * 监听字段值变化（支持通配符模式匹配）
 *
 * 订阅 ON_FIELD_VALUE_CHANGE 事件，在 handler 中用 FormPath.match 过滤。
 * 响应所有值变化来源（用户输入 + 程序赋值）。
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符，如 'address.*'）
 * @param handler - 匹配字段值变化时的回调
 * @returns 取消监听的 Disposer
 *
 * @example
 * ```ts
 * onFieldValueChange(form, 'contacts.*.name', (field) => {
 *   console.log(`联系人姓名变化: ${field.value}`)
 * })
 * ```
 */
export function onFieldValueChange(
  form: FormInstance,
  pattern: string,
  handler: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  return form.on(FormLifeCycle.ON_FIELD_VALUE_CHANGE, (event) => {
    const { path } = event.payload as { path: string, value: unknown }
    if (!FormPath.match(pattern, path)) return

    const field = form.getField(path)
    if (field) {
      handler(field, form)
    }
  })
}

/**
 * 监听字段用户输入（仅用户在 UI 上的输入，不包含程序赋值）
 *
 * 与 onFieldValueChange 的区别：
 * - onFieldInputChange 仅在用户通过 UI 输入时触发
 * - 程序调用 field.setValue() 不会触发
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符）
 * @param handler - 匹配字段输入时的回调
 * @returns 取消监听的 Disposer
 */
export function onFieldInputChange(
  form: FormInstance,
  pattern: string,
  handler: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  return form.on(FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE, (event) => {
    const { path } = event.payload as { path: string, value: unknown }
    if (!FormPath.match(pattern, path)) return

    const field = form.getField(path)
    if (field) {
      handler(field, form)
    }
  })
}

/**
 * 监听字段初始化（字段创建时触发）
 *
 * 订阅 ON_FIELD_INIT 事件，在匹配字段创建时执行回调。
 * 适用于：动态字段创建时的初始化逻辑。
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符）
 * @param handler - 匹配字段初始化时的回调
 * @returns 取消监听的 Disposer
 *
 * @example
 * ```ts
 * onFieldInit(form, 'contacts.*', (field) => {
 *   console.log(`新联系人字段创建: ${field.path}`)
 * })
 * ```
 */
export function onFieldInit(
  form: FormInstance,
  pattern: string,
  handler: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  return form.on(FormLifeCycle.ON_FIELD_INIT, (event) => {
    const field = event.payload as FieldInstance
    if (!field.path || !FormPath.match(pattern, field.path)) return
    handler(field, form)
  })
}

/**
 * 监听字段挂载（字段渲染到 DOM 时触发）
 *
 * 与 onFieldInit 的区别：
 * - onFieldInit 在字段模型创建时触发（可能还未渲染到 DOM）
 * - onFieldMount 在字段组件实际挂载到 DOM 后触发
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符）
 * @param handler - 匹配字段挂载时的回调
 * @returns 取消监听的 Disposer
 */
export function onFieldMount(
  form: FormInstance,
  pattern: string,
  handler: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  return form.on(FormLifeCycle.ON_FIELD_MOUNT, (event) => {
    const field = event.payload as FieldInstance | VoidFieldInstance
    if (!field.path || !FormPath.match(pattern, field.path)) return
    handler(field as FieldInstance, form)
  })
}

/**
 * 监听字段卸载（字段从 DOM 卸载时触发）
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符）
 * @param handler - 匹配字段卸载时的回调
 * @returns 取消监听的 Disposer
 */
export function onFieldUnmount(
  form: FormInstance,
  pattern: string,
  handler: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  return form.on(FormLifeCycle.ON_FIELD_UNMOUNT, (event) => {
    const field = event.payload as FieldInstance | VoidFieldInstance
    if (!field.path || !FormPath.match(pattern, field.path)) return
    handler(field as FieldInstance, form)
  })
}

/**
 * 响应式监听（自动追踪依赖，依赖变化时重新执行）
 *
 * 使用响应式适配器的 autorun API 实现自动依赖追踪。
 * 回调函数中访问的响应式属性（如 form.values.xxx、field.visible 等）
 * 会被自动追踪，任何依赖变化时回调自动重新执行。
 *
 * @param form - 表单实例
 * @param callback - 响应式回调（自动追踪依赖）
 * @returns 取消监听的 Disposer
 *
 * @example
 * ```ts
 * onFormReact(form, (form) => {
 *   // 自动追踪 form.values.firstName 和 form.values.lastName
 *   form.setFieldState('fullName', {
 *     value: `${form.values.firstName ?? ''} ${form.values.lastName ?? ''}`.trim(),
 *   })
 * })
 * ```
 */
export function onFormReact(
  form: FormInstance,
  callback: (form: FormInstance) => void,
): Disposer {
  const adapter = getReactiveAdapter()
  return adapter.autorun(() => {
    callback(form)
  })
}

/**
 * 字段级响应式监听
 *
 * 订阅 ON_FIELD_MOUNT 事件，在匹配字段挂载时为其创建 autorun。
 * 字段卸载时自动清理 autorun。
 *
 * @param form - 表单实例
 * @param pattern - 字段路径模式（支持 * 通配符）
 * @param callback - 响应式回调
 * @returns 取消所有监听的 Disposer
 *
 * @example
 * ```ts
 * onFieldReact(form, 'price', (field) => {
 *   // 当 price 字段的值变化时自动执行
 *   if (field.value > 10000) {
 *     form.setFieldState('discount', { visible: true })
 *   }
 * })
 * ```
 */
export function onFieldReact(
  form: FormInstance,
  pattern: string,
  callback: (field: FieldInstance, form: FormInstance) => void,
): Disposer {
  const adapter = getReactiveAdapter()
  /** 跟踪每个字段的 autorun disposer */
  const fieldAutorunDisposers = new Map<string, Disposer>()

  /** 为匹配字段创建 autorun */
  const setupAutorun = (field: FieldInstance): void => {
    /* 清理同路径的旧 autorun（防止重复挂载） */
    fieldAutorunDisposers.get(field.path)?.()
    const disposer = adapter.autorun(() => {
      callback(field, form)
    })
    fieldAutorunDisposers.set(field.path, disposer)
  }

  /* 为已挂载的匹配字段立即创建 autorun */
  const allFields = form.getAllFields()
  for (const [path, field] of allFields) {
    if (FormPath.match(pattern, path) && (field as FieldInstance).mounted) {
      setupAutorun(field as FieldInstance)
    }
  }

  /* 监听后续挂载的字段 */
  const mountDisposer = form.on(FormLifeCycle.ON_FIELD_MOUNT, (event) => {
    const field = event.payload as FieldInstance
    if (!field.path || !FormPath.match(pattern, field.path)) return
    setupAutorun(field)
  })

  /* 监听字段卸载时清理 autorun */
  const unmountDisposer = form.on(FormLifeCycle.ON_FIELD_UNMOUNT, (event) => {
    const field = event.payload as FieldInstance
    if (!field.path) return
    const autorunDisposer = fieldAutorunDisposers.get(field.path)
    if (autorunDisposer) {
      autorunDisposer()
      fieldAutorunDisposers.delete(field.path)
    }
  })

  /* 返回总的清理函数 */
  return () => {
    mountDisposer()
    unmountDisposer()
    for (const disposer of fieldAutorunDisposers.values()) {
      disposer()
    }
    fieldAutorunDisposers.clear()
  }
}
