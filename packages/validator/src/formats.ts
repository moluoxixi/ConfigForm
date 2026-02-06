import type { FormatValidator } from './types'

/** 内置格式验证正则 */
const FORMAT_PATTERNS: Record<string, RegExp> = {
  email: /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  url: /^https?:\/\/[^\s/$.?#].\S*$/i,
  phone: /^1[3-9]\d{9}$/,
  idcard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i,
  ip: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$|^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/,
  ipv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
  number: /^-?\d+(\.\d+)?$/,
  integer: /^-?\d+$/,
  positive: /^\d+(\.\d+)?$/,
  positiveInteger: /^\d+$/,
}

/** 格式验证器注册表 */
const formatRegistry = new Map<string, FormatValidator>()

/* 注册内置格式 */
for (const [name, pattern] of Object.entries(FORMAT_PATTERNS)) {
  formatRegistry.set(name, (value: string) => pattern.test(value))
}

/**
 * 注册自定义格式验证器
 * @param name - 格式名称
 * @param validator - 验证函数
 */
export function registerFormat(name: string, validator: FormatValidator): void {
  formatRegistry.set(name, validator)
}

/**
 * 获取格式验证器
 */
export function getFormatValidator(name: string): FormatValidator | undefined {
  return formatRegistry.get(name)
}

/**
 * 判断格式验证器是否已注册
 */
export function hasFormat(name: string): boolean {
  return formatRegistry.has(name)
}
