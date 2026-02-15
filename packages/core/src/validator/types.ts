/** 验证规则定义 */
export interface ValidationRule {
  /** 规则唯一标识（动态增删时使用） */
  id?: string
  /** 内置格式验证 */
  format?: BuiltinFormat | string
  /** 必填 */
  required?: boolean
  /** 数值最小值 */
  min?: number
  /** 数值最大值 */
  max?: number
  /** 独占最小值 */
  exclusiveMin?: number
  /** 独占最大值 */
  exclusiveMax?: number
  /** 最小长度 */
  minLength?: number
  /** 最大长度 */
  maxLength?: number
  /** 正则表达式 */
  pattern?: RegExp | string
  /** 枚举值列表 */
  enum?: (string | number | boolean)[]
  /** 自定义同步验证 */
  validator?: (value: unknown, rule: ValidationRule, context: ValidatorContext) => string | void
  /** 自定义异步验证（支持 AbortSignal 取消） */
  asyncValidator?: (
    value: unknown,
    rule: ValidationRule,
    context: ValidatorContext,
    signal: AbortSignal,
  ) => Promise<string | void>
  /** 验证触发时机 */
  trigger?: ValidationTrigger | ValidationTrigger[]
  /** 级别：error 阻塞提交，warning 仅提示 */
  level?: 'error' | 'warning'
  /** 错误消息（字符串或模板函数） */
  message?: string | ((rule: ValidationRule) => string)
  /** 首个规则失败后停止后续验证 */
  stopOnFirstFailure?: boolean
  /** 异步验证防抖（ms） */
  debounce?: number
}

/** 内置格式类型 */
export type BuiltinFormat
  = | 'email'
    | 'url'
    | 'phone'
    | 'idcard'
    | 'ip'
    | 'ipv4'
    | 'ipv6'
    | 'number'
    | 'integer'
    | 'positive'
    | 'positiveInteger'

/** 验证触发时机 */
export type ValidationTrigger = 'change' | 'blur' | 'submit'

/** 验证器上下文 */
export interface ValidatorContext {
  /** 当前字段路径 */
  path: string
  /** 当前字段标签 */
  label?: string
  /** 获取其他字段值 */
  getFieldValue: (path: string) => unknown
  /** 获取所有值 */
  getValues: () => Record<string, unknown>
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否全部通过 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationFeedback[]
  /** 警告列表 */
  warnings: ValidationFeedback[]
}

/** 验证反馈 */
export interface ValidationFeedback {
  path: string
  message: string
  type: 'error' | 'warning'
  ruleName?: string
}

/** 格式验证器 */
export type FormatValidator = (value: string) => boolean

/** 验证消息模板 */
export interface ValidationMessages {
  required?: string
  format?: string
  min?: string
  max?: string
  exclusiveMin?: string
  exclusiveMax?: string
  minLength?: string
  maxLength?: string
  pattern?: string
  enum?: string
  [key: string]: string | undefined
}
