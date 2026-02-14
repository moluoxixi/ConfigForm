import type { Disposer } from './shared'
import type {
  CreateFieldHook,
  FieldInstance,
  FieldProps,
  FormInstance,
  ResetHook,
  ResetOptions,
  SetValuesHook,
  SubmitHook,
  SubmitResult,
  ValidateHook,
  ValidateResult,
} from './types'

/**
 * 带优先级的 Hook 处理器
 */
interface PrioritizedHandler<T> {
  /** 处理函数 */
  handler: T
  /** 优先级（数字越小越先执行，默认 100） */
  priority: number
}

/**
 * 通用 Hook 管道
 *
 * 维护一组按优先级排序的中间件处理器，
 * 执行时按洋葱模型串联（每个 handler 通过 next() 传递给下一个）。
 */
class HookPipeline<H> {
  private handlers: Array<PrioritizedHandler<H>> = []

  /**
   * 注册处理器
   *
   * @param handler - 处理函数
   * @param priority - 优先级（默认 100）
   * @returns 取消注册的 Disposer
   */
  tap(handler: H, priority: number = 100): Disposer {
    const item: PrioritizedHandler<H> = { handler, priority }
    this.handlers.push(item)
    /* 按优先级升序排列（数字越小越先执行） */
    this.handlers.sort((a, b) => a.priority - b.priority)

    return () => {
      const idx = this.handlers.indexOf(item)
      if (idx !== -1)
        this.handlers.splice(idx, 1)
    }
  }

  /** 获取已排序的处理器列表 */
  getHandlers(): H[] {
    return this.handlers.map(h => h.handler)
  }

  /** 清空所有处理器 */
  clear(): void {
    this.handlers = []
  }
}

/**
 * 表单 Hook 管理器
 *
 * 管理 5 条核心 Hook 管线：submit / validate / setValues / createField / reset。
 * 每条管线使用洋葱模型执行：
 *
 * ```
 * handler1(ctx, next) → handler2(ctx, next) → ... → 原始逻辑
 *                    ←                      ← ... ← 结果回传
 * ```
 *
 * 插件通过 PluginContext.hooks 注册拦截器，
 * Form 类在执行操作时通过 run*() 方法驱动管线。
 */
export class FormHookManager {
  /** 提交管线 */
  readonly submit = new HookPipeline<SubmitHook>()
  /** 验证管线 */
  readonly validate = new HookPipeline<ValidateHook>()
  /** 赋值管线 */
  readonly setValues = new HookPipeline<SetValuesHook>()
  /** 字段创建管线 */
  readonly createField = new HookPipeline<CreateFieldHook>()
  /** 重置管线 */
  readonly reset = new HookPipeline<ResetHook>()

  /**
   * 执行提交管线
   *
   * 将所有 submit hook 按洋葱模型串联，最内层是原始提交逻辑。
   *
   * @param form - 表单实例
   * @param original - 原始提交逻辑
   * @returns 提交结果
   */
  async runSubmit(
    form: FormInstance,
    original: () => Promise<SubmitResult>,
  ): Promise<SubmitResult> {
    const handlers = this.submit.getHandlers()
    if (handlers.length === 0)
      return original()

    const ctx = { form }

    /* 构建洋葱：从最后一个 handler 开始包裹，最内层是 original */
    let pipeline = original
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i]
      const next = pipeline
      pipeline = () => handler(ctx, next)
    }

    return pipeline()
  }

  /**
   * 执行验证管线
   *
   * @param form - 表单实例
   * @param pattern - 验证模式（通配符或 undefined）
   * @param original - 原始验证逻辑
   * @returns 验证结果
   */
  async runValidate(
    form: FormInstance,
    pattern: string | undefined,
    original: () => Promise<ValidateResult>,
  ): Promise<ValidateResult> {
    const handlers = this.validate.getHandlers()
    if (handlers.length === 0)
      return original()

    const ctx = { form, pattern }

    let pipeline = original
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i]
      const next = pipeline
      pipeline = () => handler(ctx, next)
    }

    return pipeline()
  }

  /**
   * 执行赋值管线
   *
   * @param form - 表单实例
   * @param values - 要设置的值
   * @param strategy - 合并策略
   * @param original - 原始赋值逻辑
   */
  runSetValues(
    form: FormInstance,
    values: Record<string, unknown>,
    strategy: string,
    original: () => void,
  ): void {
    const handlers = this.setValues.getHandlers()
    if (handlers.length === 0) {
      original()
      return
    }

    const ctx = { form, values, strategy }

    let pipeline = original
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i]
      const next = pipeline
      pipeline = () => handler(ctx, next)
    }

    pipeline()
  }

  /**
   * 执行字段创建管线
   *
   * createField hook 较特殊：next() 接收可能被修改的 props，
   * 返回创建后的字段实例。
   *
   * @param form - 表单实例
   * @param props - 字段属性
   * @param original - 原始创建逻辑（接收 props，返回 FieldInstance）
   * @returns 字段实例
   */
  runCreateField<V = unknown>(
    form: FormInstance,
    props: FieldProps<V>,
    original: (props: FieldProps<V>) => FieldInstance<V>,
  ): FieldInstance<V> {
    const handlers = this.createField.getHandlers()
    if (handlers.length === 0)
      return original(props)

    /* createField 管线：每层可修改 props，传给 next */
    let pipeline: (p: FieldProps) => FieldInstance = p => original(p as FieldProps<V>) as unknown as FieldInstance
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i]
      const next = pipeline
      pipeline = p => handler({ form, props: p }, next)
    }

    return pipeline(props as FieldProps) as unknown as FieldInstance<V>
  }

  /**
   * 执行重置管线
   *
   * @param form - 表单实例
   * @param options - 重置选项
   * @param original - 原始重置逻辑
   */
  runReset(
    form: FormInstance,
    options: ResetOptions | undefined,
    original: () => void,
  ): void {
    const handlers = this.reset.getHandlers()
    if (handlers.length === 0) {
      original()
      return
    }

    const ctx = { form, options }

    let pipeline = original
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i]
      const next = pipeline
      pipeline = () => handler(ctx, next)
    }

    pipeline()
  }

  /** 清空所有管线 */
  dispose(): void {
    this.submit.clear()
    this.validate.clear()
    this.setValues.clear()
    this.createField.clear()
    this.reset.clear()
  }
}
