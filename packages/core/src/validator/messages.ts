import type { ValidationMessages, ValidationRule } from './types'

/** 消息模板中的变量替换 */
function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  })
}

/** 默认验证消息 */
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

/** 全局覆盖消息（框架外可注入自定义模板） */
let registeredMessages: ValidationMessages = {}

/** 注册验证消息模板（全局合并） */
export function registerMessages(messages: ValidationMessages): void {
  registeredMessages = { ...registeredMessages, ...messages }
}

/**
 * 获取验证消息
 * 优先级：rule.message > 注册模板 > 默认模板
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

  /* 2. 注册模板 */
  const messages = { ...defaultMessages, ...registeredMessages }
  const template = messages[ruleName] ?? defaultMessages[ruleName as keyof typeof defaultMessages]

  if (template) {
    return interpolate(template, { label, ...rule })
  }

  return `${label}验证失败`
}
