import type { FormatValidator } from './types'

/**
 * 内置格式验证正则
 *
 * 注意事项：
 * - phone: 仅适用于中国大陆手机号
 * - idcard: 仅适用于中国大陆二代身份证
 * - positive/positiveInteger: 不包含 0
 */
const FORMAT_PATTERNS: Record<string, RegExp> = {
  /** 电子邮箱 */
  email: /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  /** URL（http/https） */
  url: /^https?:\/\/[^\s/$.?#]\S*$/i,
  /** 中国大陆手机号 */
  phone: /^1[3-9]\d{9}$/,
  /** 中国大陆二代身份证号 */
  idcard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i,
  /** IPv4 地址 */
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/,
  /**
   * IPv6 地址（支持完整格式和压缩格式）
   *
   * 匹配：2001:db8::1, ::1, fe80::1%eth0, 完整的 8 组格式
   */
  ipv6: /^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:))$/i,
  /** IP 地址（IPv4 或 IPv6） */
  ip: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$|^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:))$/i,
  /** 数字（含负数和小数） */
  number: /^-?\d+(\.\d+)?$/,
  /** 整数（含负数） */
  integer: /^-?\d+$/,
  /** 正数（不含 0） */
  positive: /^(?!0+(\.0+)?$)\d+(\.\d+)?$/,
  /** 正整数（不含 0） */
  positiveInteger: /^[1-9]\d*$/,
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
