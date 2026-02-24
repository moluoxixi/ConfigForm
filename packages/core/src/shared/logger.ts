/**
 * 统一日志系统
 *
 * 提供分级日志输出，统一前缀格式，支持运行时调整日志级别。
 * 生产环境建议设置为 'error'，开发环境设置为 'warn' 或 'debug'。
 *
 * @example
 * ```ts
 * import { logger } from '@moluoxixi/core'
 *
 * // 调整日志级别
 * logger.setLevel('debug')
 *
 * // 使用
 * logger.debug('调试信息', { context })
 * logger.warn('潜在问题', someValue)
 * logger.error('操作失败', error)
 * ```
 */

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/** 日志级别优先级映射 */
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

/** 统一前缀 */
const PREFIX = '[ConfigForm]'

/** 当前日志级别（默认 warn，仅输出 warn 和 error） */
let currentLevel: LogLevel = 'warn'

/**
 * 判断是否应该输出
 * @param level 待输出日志的级别。
 * @returns 当 level 不低于当前日志阈值时返回 true。
 */
function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel]
}

/**
 * 统一日志门面。
 * 所有输出都会携带固定前缀，便于在控制台快速筛选 ConfigForm 日志。
 */
export const logger = {
  /**
   * 设置日志级别
   *
   * @param level - 日志级别，低于此级别的日志不输出
   */
  setLevel(level: LogLevel): void {
    currentLevel = level
  },

  /**
   * 获取当前日志级别
   * @returns 当前日志级别。
   */
  getLevel(): LogLevel {
    return currentLevel
  },

  /**
   * 调试日志（开发环境使用）
   * @param message 主日志文本。
   * @param args 额外上下文参数，会原样透传到 console。
   */
  debug(message: string, ...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.debug(`${PREFIX} ${message}`, ...args)
    }
  },

  /**
   * 信息日志
   * @param message 主日志文本。
   * @param args 额外上下文参数，会原样透传到 console。
   */
  info(message: string, ...args: unknown[]): void {
    if (shouldLog('info')) {
      console.info(`${PREFIX} ${message}`, ...args)
    }
  },

  /**
   * 警告日志
   * @param message 主日志文本。
   * @param args 额外上下文参数，会原样透传到 console。
   */
  warn(message: string, ...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(`${PREFIX} ${message}`, ...args)
    }
  },

  /**
   * 错误日志
   * @param message 主日志文本。
   * @param args 额外上下文参数，会原样透传到 console。
   */
  error(message: string, ...args: unknown[]): void {
    if (shouldLog('error')) {
      console.error(`${PREFIX} ${message}`, ...args)
    }
  },
}
