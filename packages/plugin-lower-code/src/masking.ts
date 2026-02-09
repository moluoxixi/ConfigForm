import type { FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'

/**
 * 脱敏规则类型
 *
 * - `phone`: 手机号（138****8888）
 * - `email`: 邮箱（u***@example.com）
 * - `idcard`: 身份证号（110***********1234）
 * - `bankcard`: 银行卡号（**** **** **** 1234）
 * - `name`: 姓名（张*）
 * - `address`: 地址（北京市***）
 * - `custom`: 自定义脱敏函数
 */
export type MaskingType = 'phone' | 'email' | 'idcard' | 'bankcard' | 'name' | 'address' | 'custom'

/**
 * 脱敏规则配置
 */
export interface MaskingRule {
  /** 字段路径（精确路径或通配符模式） */
  pattern: string
  /** 脱敏类型 */
  type: MaskingType
  /** 自定义脱敏函数（type='custom' 时使用） */
  mask?: (value: unknown) => string
  /** 脱敏占位符（默认 '*'） */
  placeholder?: string
}

/** 插件配置 */
export interface MaskingPluginConfig {
  /** 脱敏规则列表 */
  rules: MaskingRule[]
  /** 全局占位符（默认 '*'） */
  placeholder?: string
}

/** 插件暴露的 API */
export interface MaskingPluginAPI {
  /** 对指定路径的值执行脱敏 */
  mask: (path: string, value: unknown) => string
  /** 直接脱敏单个值 */
  maskValue: (value: unknown, rule: MaskingRule) => string
  /** 注册自定义脱敏类型 */
  registerType: (name: string, maskFn: (value: string, placeholder: string) => string) => void
}

/** 默认占位符 */
const DEFAULT_PLACEHOLDER = '*'

/** 内置脱敏策略 */
const BUILTIN_MASKING: Record<string, (value: string, placeholder: string) => string> = {
  /** 手机号脱敏：保留前 3 后 4 */
  phone(value: string, placeholder: string): string {
    if (value.length < 7) return value
    return value.slice(0, 3) + placeholder.repeat(4) + value.slice(-4)
  },

  /** 邮箱脱敏：用户名保留首尾字符 */
  email(value: string, placeholder: string): string {
    const atIndex = value.indexOf('@')
    if (atIndex <= 1) return value
    const username = value.slice(0, atIndex)
    const domain = value.slice(atIndex)
    if (username.length <= 2) {
      return username[0] + placeholder.repeat(3) + domain
    }
    return username[0] + placeholder.repeat(3) + username[username.length - 1] + domain
  },

  /** 身份证号脱敏：保留前 3 后 4 */
  idcard(value: string, placeholder: string): string {
    if (value.length < 7) return value
    const maskLen = value.length - 7
    return value.slice(0, 3) + placeholder.repeat(maskLen) + value.slice(-4)
  },

  /** 银行卡号脱敏：仅显示后 4 位 */
  bankcard(value: string, placeholder: string): string {
    if (value.length < 4) return value
    const last4 = value.slice(-4)
    const masked = placeholder.repeat(4)
    return `${masked} ${masked} ${masked} ${last4}`
  },

  /** 姓名脱敏：保留首字 */
  name(value: string, placeholder: string): string {
    if (value.length <= 1) return value
    if (value.length === 2) return value[0] + placeholder
    return value.slice(0, -1) + placeholder.repeat(value.length - 1)
  },

  /** 地址脱敏：保留前 6 个字符 */
  address(value: string, placeholder: string): string {
    const keepLength = Math.min(6, Math.floor(value.length / 2))
    if (value.length <= keepLength) return value
    return value.slice(0, keepLength) + placeholder.repeat(value.length - keepLength)
  },
}

/**
 * 简单的路径模式匹配
 *
 * 支持 '*' 匹配单层，'**' 匹配任意层。
 */
function matchPattern(pattern: string, path: string): boolean {
  if (pattern === path) return true
  if (pattern === '*') return true

  const patternParts = pattern.split('.')
  const pathParts = path.split('.')
  let pi = 0
  let pp = 0

  while (pi < patternParts.length && pp < pathParts.length) {
    if (patternParts[pi] === '**') {
      if (pi === patternParts.length - 1) return true
      pi++
      while (pp < pathParts.length) {
        if (patternParts[pi] === pathParts[pp] || patternParts[pi] === '*') break
        pp++
      }
    }
    else if (patternParts[pi] === '*' || patternParts[pi] === pathParts[pp]) {
      pi++
      pp++
    }
    else {
      return false
    }
  }

  return pi === patternParts.length && pp === pathParts.length
}

/** 插件名称 */
export const PLUGIN_NAME = 'masking'

/**
 * 对单个值执行脱敏
 */
export function maskValue(
  value: unknown,
  rule: MaskingRule,
  globalPlaceholder: string = DEFAULT_PLACEHOLDER,
): string {
  if (value === null || value === undefined || value === '') return ''
  const strValue = String(value)
  const placeholder = rule.placeholder ?? globalPlaceholder

  if (rule.type === 'custom' && rule.mask) {
    return rule.mask(value)
  }

  const maskFn = BUILTIN_MASKING[rule.type]
  if (maskFn) {
    return maskFn(strValue, placeholder)
  }
  return strValue
}

/**
 * 数据脱敏插件
 *
 * 字段值脱敏展示，支持手机号、邮箱、身份证、银行卡等内置类型，
 * 可注册自定义脱敏类型。
 *
 * @param config - 插件配置
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { maskingPlugin, type MaskingPluginAPI } from '@moluoxixi/plugin-masking'
 *
 * const form = createForm({
 *   plugins: [
 *     maskingPlugin({
 *       rules: [
 *         { pattern: 'phone', type: 'phone' },
 *         { pattern: 'email', type: 'email' },
 *       ],
 *     }),
 *   ],
 * })
 *
 * const masking = form.getPlugin<MaskingPluginAPI>('masking')!
 * masking.mask('phone', '13812345678') // → '138****5678'
 * ```
 */
export function maskingPlugin(config: MaskingPluginConfig): FormPlugin<MaskingPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(_form: unknown, _context: PluginContext): PluginInstallResult<MaskingPluginAPI> {
      const { rules, placeholder: globalPlaceholder = DEFAULT_PLACEHOLDER } = config

      const api: MaskingPluginAPI = {
        mask(path: string, value: unknown): string {
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i]
            if (matchPattern(rule.pattern, path)) {
              return maskValue(value, rule, globalPlaceholder)
            }
          }
          return value === null || value === undefined ? '' : String(value)
        },

        maskValue(value: unknown, rule: MaskingRule): string {
          return maskValue(value, rule, globalPlaceholder)
        },

        registerType(name: string, maskFn: (value: string, placeholder: string) => string): void {
          BUILTIN_MASKING[name] = maskFn
        },
      }

      return { api }
    },
  }
}
