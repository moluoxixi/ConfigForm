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
  if (isNumber(rule.min) && isNumber(value as number) && (value as number) < rule.min) {
    return getMessage('min', rule, label)
  }
  if (isNumber(rule.max) && isNumber(value as number) && (value as number) > rule.max) {
    return getMessage('max', rule, label)
  }
  if (isNumber(rule.exclusiveMin) && isNumber(value as number) && (value as number) <= rule.exclusiveMin) {
    return getMessage('exclusiveMin', rule, label)
  }
  if (isNumber(rule.exclusiveMax) && isNumber(value as number) && (value as number) >= rule.exclusiveMax) {
    return getMessage('exclusiveMax', rule, label)
  }

  /* minLength / maxLength */
  const strVal = isString(value) ? value : isArray(value) ? value : null
  if (strVal !== null) {
    const len = isString(strVal) ? strVal.length : (strVal as unknown[]).length
    if (isNumber(rule.minLength) && len < rule.minLength) {
      return getMessage('minLength', rule, label)
    }
    if (isNumber(rule.maxLength) && len > rule.maxLength) {
      return getMessage('maxLength', rule, label)
    }
  }

  /* pattern */
  if (rule.pattern) {
    const regex = isString(rule.pattern) ? new RegExp(rule.pattern) : rule.pattern
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
 * 验证字段值
 *
 * @param value - 字段值
 * @param rules - 验证规则列表
 * @param context - 验证上下文（提供路径、跨字段取值等）
 * @param trigger - 当前触发时机（可选）
 * @returns 验证结果
 */
export async function validate(
  value: unknown,
  rules: ValidationRule[],
  context: ValidatorContext,
  trigger?: ValidationTrigger,
): Promise<ValidationResult> {
  const filteredRules = filterRulesByTrigger(rules, trigger)
  const errors: ValidationFeedback[] = []
  const warnings: ValidationFeedback[] = []
  const label = context.label ?? context.path

  for (const rule of filteredRules) {
    /* 同步验证 */
    const syncMsg = validateRuleSync(value, rule, context, label)
    if (syncMsg) {
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
      if (rule.stopOnFirstFailure)
        break
      continue
    }

    /* 异步验证（仅在同步验证通过后执行） */
    if (rule.asyncValidator && !isNullish(value) && !isEmpty(value)) {
      const controller = new AbortController()
      try {
        const asyncMsg = await rule.asyncValidator(value, rule, context, controller.signal)
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
      if (rule.stopOnFirstFailure)
        break
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
