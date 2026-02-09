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

/** 脱敏管理器配置 */
export interface MaskingConfig {
  /** 脱敏规则列表 */
  rules: MaskingRule[]
  /** 全局占位符（默认 '*'） */
  placeholder?: string
}

/** 默认占位符 */
const DEFAULT_PLACEHOLDER = '*'

/**
 * 内置脱敏策略
 *
 * 每种类型对应一个脱敏函数，将原始值转换为脱敏后的显示文本。
 */
const BUILTIN_MASKING: Record<Exclude<MaskingType, 'custom'>, (value: string, placeholder: string) => string> = {
  /**
   * 手机号脱敏：保留前 3 后 4
   * 13812345678 → 138****5678
   */
  phone(value: string, placeholder: string): string {
    if (value.length < 7) return value
    const p = placeholder.repeat(4)
    return value.slice(0, 3) + p + value.slice(-4)
  },

  /**
   * 邮箱脱敏：用户名保留首尾字符
   * user@example.com → u***r@example.com
   */
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

  /**
   * 身份证号脱敏：保留前 3 后 4
   * 110101199001011234 → 110***********1234
   */
  idcard(value: string, placeholder: string): string {
    if (value.length < 7) return value
    const maskLen = value.length - 7
    return value.slice(0, 3) + placeholder.repeat(maskLen) + value.slice(-4)
  },

  /**
   * 银行卡号脱敏：仅显示后 4 位
   * 6222021234561234 → **** **** **** 1234
   */
  bankcard(value: string, placeholder: string): string {
    if (value.length < 4) return value
    const last4 = value.slice(-4)
    const masked = placeholder.repeat(4)
    return `${masked} ${masked} ${masked} ${last4}`
  },

  /**
   * 姓名脱敏：保留首字
   * 张三 → 张*
   * 欧阳修 → 欧阳*
   */
  name(value: string, placeholder: string): string {
    if (value.length <= 1) return value
    if (value.length === 2) return value[0] + placeholder
    return value.slice(0, -1) + placeholder.repeat(value.length - 1)
  },

  /**
   * 地址脱敏：保留前 6 个字符
   * 北京市朝阳区某某路1号 → 北京市朝阳区*****
   */
  address(value: string, placeholder: string): string {
    const keepLength = Math.min(6, Math.floor(value.length / 2))
    if (value.length <= keepLength) return value
    return value.slice(0, keepLength) + placeholder.repeat(value.length - keepLength)
  },
}

/**
 * 对单个值执行脱敏
 *
 * @param value - 原始值
 * @param rule - 脱敏规则
 * @param globalPlaceholder - 全局占位符
 * @returns 脱敏后的文本
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

  const maskFn = BUILTIN_MASKING[rule.type as Exclude<MaskingType, 'custom'>]
  if (maskFn) {
    return maskFn(strValue, placeholder)
  }

  return strValue
}

/**
 * 创建脱敏处理器
 *
 * 返回一个函数，传入字段路径和值，返回脱敏后的文本。
 * 适用于 readPretty 模式下的值展示。
 *
 * @param config - 脱敏配置
 * @returns 脱敏处理函数
 *
 * @example
 * ```ts
 * const masker = createMasker({
 *   rules: [
 *     { pattern: 'phone', type: 'phone' },
 *     { pattern: 'email', type: 'email' },
 *     { pattern: 'contacts.*.phone', type: 'phone' },
 *     { pattern: 'secret', type: 'custom', mask: () => '***机密***' },
 *   ],
 * })
 *
 * masker('phone', '13812345678') // → '138****5678'
 * masker('email', 'user@example.com') // → 'u***r@example.com'
 * masker('name', 'no-rule') // → 'no-rule'（无匹配规则，原样返回）
 * ```
 */
export function createMasker(config: MaskingConfig): (path: string, value: unknown) => string {
  const { rules, placeholder: globalPlaceholder = DEFAULT_PLACEHOLDER } = config

  return (path: string, value: unknown): string => {
    /* 倒序遍历规则，后定义的优先 */
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i]
      if (matchMaskPattern(rule.pattern, path)) {
        return maskValue(value, rule, globalPlaceholder)
      }
    }

    /* 无匹配规则，原样返回 */
    return value === null || value === undefined ? '' : String(value)
  }
}

/**
 * 注册自定义脱敏类型
 *
 * 扩展内置脱敏策略，注册后可在 MaskingRule.type 中使用。
 *
 * @param name - 脱敏类型名称
 * @param maskFn - 脱敏函数
 */
export function registerMaskingType(
  name: string,
  maskFn: (value: string, placeholder: string) => string,
): void {
  ;(BUILTIN_MASKING as Record<string, typeof maskFn>)[name] = maskFn
}

/**
 * 简单的路径模式匹配
 *
 * 支持 '*' 匹配单层，'**' 匹配任意层。
 */
function matchMaskPattern(pattern: string, path: string): boolean {
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
      /* 跳过路径部分直到匹配下一个模式 */
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
