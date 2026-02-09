import type {
  ValidationFeedback,
  ValidationResult,
  ValidationRule,
  ValidationTrigger,
  ValidatorContext,
} from './types'
import { isArray, isEmpty, isNullish, isNumber, isString } from '@moluoxixi/shared'
import { getFormatValidator } from './formats'
import { getMessage } from './messages'

/**
 * 安全创建正则表达式
 *
 * 如果 pattern 字符串语法无效，返回 null 而非抛出 SyntaxError。
 */
function safeCreateRegExp(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern)
  }
  catch {
    return null
  }
}

/**
 * 执行单条规则验证（同步部分）
 */
function validateRuleSync(
  value: unknown,
  rule: ValidationRule,
  context: ValidatorContext,
  label: string,
): string | null {
  /* required */
  if (rule.required && isEmpty(value)) {
    return getMessage('required', rule, label)
  }

  /* 空值不做后续验证（非 required 空值直接通过） */
  if (isEmpty(value))
    return null

  /* format */
  if (rule.format) {
    const validator = getFormatValidator(rule.format)
    if (validator && !validator(String(value))) {
      return getMessage('format', rule, label)
    }
  }

  /* min / max */
  if (isNumber(rule.min) && isNumber(value) && (value as number) < rule.min) {
    return getMessage('min', rule, label)
  }
  if (isNumber(rule.max) && isNumber(value) && (value as number) > rule.max) {
    return getMessage('max', rule, label)
  }
  if (isNumber(rule.exclusiveMin) && isNumber(value) && (value as number) <= rule.exclusiveMin) {
    return getMessage('exclusiveMin', rule, label)
  }
  if (isNumber(rule.exclusiveMax) && isNumber(value) && (value as number) >= rule.exclusiveMax) {
    return getMessage('exclusiveMax', rule, label)
  }

  /* minLength / maxLength */
  const measurable = isString(value) ? value : isArray(value) ? value : null
  if (measurable !== null) {
    const len = measurable.length
    if (isNumber(rule.minLength) && len < rule.minLength) {
      return getMessage('minLength', rule, label)
    }
    if (isNumber(rule.maxLength) && len > rule.maxLength) {
      return getMessage('maxLength', rule, label)
    }
  }

  /* pattern */
  if (rule.pattern) {
    const regex = isString(rule.pattern) ? safeCreateRegExp(rule.pattern) : rule.pattern
    if (regex === null) {
      /* 无效正则字符串：视为验证失败，返回格式错误提示而非崩溃 */
      const msg = typeof rule.message === 'function' ? rule.message(rule) : rule.message
      return msg ?? `${label} 的验证正则表达式无效`
    }
    if (!regex.test(String(value))) {
      return getMessage('pattern', rule, label)
    }
  }

  /* enum */
  if (rule.enum && !rule.enum.includes(value as string | number | boolean)) {
    return getMessage('enum', rule, label)
  }

  /* 自定义同步验证器 */
  if (rule.validator) {
    const result = rule.validator(value, rule, context)
    if (isString(result) && result.length > 0) {
      return result
    }
  }

  return null
}

/**
 * 根据触发时机过滤规则
 *
 * 参考 Formily 设计：
 * - 规则未设置 trigger → 在所有时机执行（change / blur / submit）
 * - 规则显式设置 trigger → 严格按 trigger 匹配
 * - 调用方未传 trigger → 执行所有规则（手动调用 / submit 场景）
 *
 * 如需某条规则仅在 blur 时验证，显式设置 `trigger: 'blur'`。
 */
function filterRulesByTrigger(
  rules: ValidationRule[],
  trigger?: ValidationTrigger,
): ValidationRule[] {
  if (!trigger)
    return rules
  return rules.filter((rule) => {
    if (!rule.trigger)
      return true
    const triggers = isArray(rule.trigger) ? rule.trigger : [rule.trigger]
    return triggers.includes(trigger)
  })
}

/**
 * 将同步验证消息分类到 errors 或 warnings
 *
 * @returns true 表示应停止后续规则验证（stopOnFirstFailure）
 */
function collectSyncFeedback(
  syncMsg: string,
  rule: ValidationRule,
  context: ValidatorContext,
  errors: ValidationFeedback[],
  warnings: ValidationFeedback[],
): boolean {
  const feedback: ValidationFeedback = {
    path: context.path,
    message: syncMsg,
    type: rule.level ?? 'error',
    ruleName: rule.format ?? rule.id,
  }
  if (feedback.type === 'warning') {
    warnings.push(feedback)
  }
  else {
    errors.push(feedback)
  }
  return !!rule.stopOnFirstFailure
}

/**
 * 验证字段值
 *
 * @param value - 字段值
 * @param rules - 验证规则列表
 * @param context - 验证上下文（提供路径、跨字段取值等）
 * @param trigger - 当前触发时机（可选）
 * @param signal - 外部取消信号（可选），用于在字段值变化时取消正在进行的异步验证
 * @returns 验证结果
 */
export async function validate(
  value: unknown,
  rules: ValidationRule[],
  context: ValidatorContext,
  trigger?: ValidationTrigger,
  signal?: AbortSignal,
): Promise<ValidationResult> {
  const filteredRules = filterRulesByTrigger(rules, trigger)
  const errors: ValidationFeedback[] = []
  const warnings: ValidationFeedback[] = []
  const label = context.label ?? context.path

  for (const rule of filteredRules) {
    /* 外部取消检查 */
    if (signal?.aborted) {
      break
    }

    /* 同步验证 */
    const syncMsg = validateRuleSync(value, rule, context, label)
    if (syncMsg) {
      if (collectSyncFeedback(syncMsg, rule, context, errors, warnings))
        break
      continue
    }

    /* 异步验证（仅在同步验证通过后执行） */
    if (rule.asyncValidator && !isNullish(value) && !isEmpty(value)) {
      /* 优先使用外部 signal，否则创建内部 signal 用于异步调用 */
      const effectiveSignal = signal ?? new AbortController().signal
      try {
        const asyncMsg = await rule.asyncValidator(value, rule, context, effectiveSignal)
        if (isString(asyncMsg) && asyncMsg.length > 0) {
          const feedback: ValidationFeedback = {
            path: context.path,
            message: asyncMsg,
            type: rule.level ?? 'error',
            ruleName: rule.id,
          }
          if (feedback.type === 'warning') {
            warnings.push(feedback)
          }
          else {
            errors.push(feedback)
          }
          if (rule.stopOnFirstFailure)
            break
        }
      }
      catch (err) {
        /* AbortError 被忽略（验证被取消） */
        if (err instanceof DOMException && err.name === 'AbortError') {
          continue
        }
        errors.push({
          path: context.path,
          message: `验证异常: ${String(err)}`,
          type: 'error',
          ruleName: rule.id,
        })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 同步验证（仅执行同步规则）
 *
 * 复用 validateRuleSync + collectSyncFeedback，不包含异步验证逻辑。
 */
export function validateSync(
  value: unknown,
  rules: ValidationRule[],
  context: ValidatorContext,
  trigger?: ValidationTrigger,
): ValidationResult {
  const filteredRules = filterRulesByTrigger(rules, trigger)
  const errors: ValidationFeedback[] = []
  const warnings: ValidationFeedback[] = []
  const label = context.label ?? context.path

  for (const rule of filteredRules) {
    const syncMsg = validateRuleSync(value, rule, context, label)
    if (syncMsg) {
      if (collectSyncFeedback(syncMsg, rule, context, errors, warnings))
        break
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
