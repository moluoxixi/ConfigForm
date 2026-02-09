import type { ValidationMessages, ValidationRule } from './types'

/** 消息模板中的变量替换 */
function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  })
}

/** 默认中文验证消息 */
const defaultMessages: Required<ValidationMessages> = {
  required: '{label}不能为空',
  format: '{label}格式不正确',
  min: '{label}不能小于 {min}',
  max: '{label}不能大于 {max}',
  exclusiveMin: '{label}必须大于 {exclusiveMin}',
  exclusiveMax: '{label}必须小于 {exclusiveMax}',
  minLength: '{label}至少 {minLength} 个字符',
  maxLength: '{label}最多 {maxLength} 个字符',
  pattern: '{label}格式不匹配',
  enum: '{label}的值不在允许范围内',
}

/** 多语言消息注册表 */
const localeMessages = new Map<string, ValidationMessages>()
localeMessages.set('zh-CN', defaultMessages)
localeMessages.set('en-US', {
  required: '{label} is required',
  format: '{label} format is invalid',
  min: '{label} must be at least {min}',
  max: '{label} must be at most {max}',
  exclusiveMin: '{label} must be greater than {exclusiveMin}',
  exclusiveMax: '{label} must be less than {exclusiveMax}',
  minLength: '{label} must be at least {minLength} characters',
  maxLength: '{label} must be at most {maxLength} characters',
  pattern: '{label} does not match the required pattern',
  enum: '{label} must be one of the allowed values',
})

let currentLocale = 'zh-CN'

/** 注册验证消息国际化 */
export function registerMessages(locale: string, messages: ValidationMessages): void {
  const existing = localeMessages.get(locale) ?? {}
  localeMessages.set(locale, { ...existing, ...messages })
}

/** 设置当前语言 */
export function setValidationLocale(locale: string): void {
  currentLocale = locale
}

/** 获取当前语言 */
export function getValidationLocale(): string {
  return currentLocale
}

/**
 * 获取验证消息
 * 优先级：rule.message > 当前 locale > 默认中文
 */
export function getMessage(
  ruleName: string,
  rule: ValidationRule,
  label: string,
): string {
  /* 1. rule 自定义消息 */
  if (rule.message) {
    if (typeof rule.message === 'function') {
      return rule.message(rule)
    }
    return interpolate(rule.message, { label, ...rule })
  }

  /* 2. 当前 locale 消息 */
  const messages = localeMessages.get(currentLocale) ?? defaultMessages
  const template = messages[ruleName] ?? defaultMessages[ruleName as keyof typeof defaultMessages]

  if (template) {
    return interpolate(template, { label, ...rule })
  }

  return `${label}验证失败`
}
