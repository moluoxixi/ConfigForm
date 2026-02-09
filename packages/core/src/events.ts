import type { Disposer } from './shared'

/**
 * 表单生命周期事件类型
 *
 * 参考 Formily LifeCycleTypes，精简为核心事件。
 * 命名规则：`on` + 主体(Form/Field) + 动作
 */
export enum FormLifeCycle {
  /* ======================== Form 事件 ======================== */

  /** 表单初始化完成 */
  ON_FORM_INIT = 'onFormInit',
  /** 表单挂载到 DOM（区分初始化和渲染完成） */
  ON_FORM_MOUNT = 'onFormMount',
  /** 表单从 DOM 卸载 */
  ON_FORM_UNMOUNT = 'onFormUnmount',
  /** 表单值变化 */
  ON_FORM_VALUES_CHANGE = 'onFormValuesChange',
  /** 表单提交开始 */
  ON_FORM_SUBMIT_START = 'onFormSubmitStart',
  /** 表单提交成功 */
  ON_FORM_SUBMIT_SUCCESS = 'onFormSubmitSuccess',
  /** 表单提交失败（验证不通过） */
  ON_FORM_SUBMIT_FAILED = 'onFormSubmitFailed',
  /** 表单提交结束（无论成功失败） */
  ON_FORM_SUBMIT_END = 'onFormSubmitEnd',
  /** 表单重置 */
  ON_FORM_RESET = 'onFormReset',
  /** 表单验证开始 */
  ON_FORM_VALIDATE_START = 'onFormValidateStart',
  /** 表单验证成功 */
  ON_FORM_VALIDATE_SUCCESS = 'onFormValidateSuccess',
  /** 表单验证失败 */
  ON_FORM_VALIDATE_FAILED = 'onFormValidateFailed',

  /* ======================== Field 事件 ======================== */

  /** 字段创建 */
  ON_FIELD_INIT = 'onFieldInit',
  /** 字段挂载到 DOM */
  ON_FIELD_MOUNT = 'onFieldMount',
  /** 字段从 DOM 卸载 */
  ON_FIELD_UNMOUNT = 'onFieldUnmount',
  /**
   * 字段值变化（所有来源：用户输入 + 程序赋值）
   *
   * 如果只需监听用户输入，请使用 ON_FIELD_INPUT_VALUE_CHANGE。
   */
  ON_FIELD_VALUE_CHANGE = 'onFieldValueChange',
  /**
   * 字段值变化（仅用户输入）
   *
   * 与 ON_FIELD_VALUE_CHANGE 的区别：
   * - 程序调用 field.setValue() 不会触发此事件
   * - 用户在 UI 上的输入（field.onInput()）才触发
   */
  ON_FIELD_INPUT_VALUE_CHANGE = 'onFieldInputValueChange',
  /** 字段初始值变化 */
  ON_FIELD_INITIAL_VALUE_CHANGE = 'onFieldInitialValueChange',
  /** 字段验证成功 */
  ON_FIELD_VALIDATE_SUCCESS = 'onFieldValidateSuccess',
  /** 字段验证失败 */
  ON_FIELD_VALIDATE_FAILED = 'onFieldValidateFailed',
  /** 字段重置 */
  ON_FIELD_RESET = 'onFieldReset',
}

/** 事件载荷类型 */
export interface FormEvent {
  /** 事件类型 */
  type: FormLifeCycle
  /** 事件载荷（Form 事件传 form，Field 事件传 field） */
  payload: unknown
}

/** 事件订阅回调 */
export type FormEventHandler = (event: FormEvent) => void

/**
 * 轻量事件发射器
 *
 * 参考 Formily Heart，但去掉 LifeCycle 类和复杂的订阅 ID 机制，
 * 采用更简单的 Map<type, Set<handler>> 结构。
 */
export class FormEventEmitter {
  /** 按事件类型存储的处理器 */
  private handlers = new Map<FormLifeCycle, Set<FormEventHandler>>()
  /** 全局订阅（接收所有事件） */
  private globalHandlers = new Set<FormEventHandler>()

  /**
   * 订阅特定事件
   *
   * @param type - 事件类型
   * @param handler - 处理函数
   * @returns 取消订阅的 Disposer
   */
  on(type: FormLifeCycle, handler: FormEventHandler): Disposer {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  /**
   * 订阅所有事件
   *
   * @param handler - 处理函数
   * @returns 取消订阅的 Disposer
   */
  subscribe(handler: FormEventHandler): Disposer {
    this.globalHandlers.add(handler)
    return () => {
      this.globalHandlers.delete(handler)
    }
  }

  /**
   * 发布事件
   *
   * @param type - 事件类型
   * @param payload - 事件载荷
   */
  emit(type: FormLifeCycle, payload: unknown): void {
    const event: FormEvent = { type, payload }

    /* 特定事件处理器 */
    const handlers = this.handlers.get(type)
    if (handlers) {
      for (const handler of handlers) {
        handler(event)
      }
    }

    /* 全局处理器 */
    for (const handler of this.globalHandlers) {
      handler(event)
    }
  }

  /** 清空所有订阅 */
  clear(): void {
    this.handlers.clear()
    this.globalHandlers.clear()
  }
}
