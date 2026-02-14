import type { FormInstance, FormPlugin, PluginContext, PluginInstallResult, SubmitResult } from '@moluoxixi/core'

/**
 * 重试策略
 *
 * - `fixed`: 固定间隔重试
 * - `exponential`: 指数退避重试
 * - `linear`: 线性递增重试
 */
export type RetryStrategy = 'fixed' | 'exponential' | 'linear'

/** 单次提交的重试配置 */
export interface RetryConfig {
  /** 最大重试次数（默认 3） */
  maxRetries?: number
  /** 重试策略（默认 exponential） */
  strategy?: RetryStrategy
  /** 基础延迟（ms，默认 1000） */
  baseDelay?: number
  /** 最大延迟（ms，默认 30000） */
  maxDelay?: number
  /** 是否在验证失败时也重试（默认 false，仅对提交回调异常重试） */
  retryOnValidationFailure?: boolean
  /** 重试前回调（返回 false 可取消本次重试） */
  onBeforeRetry?: (attempt: number, error: Error) => boolean | Promise<boolean>
  /** 重试成功回调 */
  onRetrySuccess?: (attempt: number, result: SubmitResult) => void
  /** 所有重试耗尽回调 */
  onRetriesExhausted?: (error: Error) => void
  /** 取消信号 */
  signal?: AbortSignal
}

/** 插件配置（默认重试参数） */
export interface SubmitRetryPluginConfig {
  /** 最大重试次数（默认 3） */
  maxRetries?: number
  /** 重试策略（默认 exponential） */
  strategy?: RetryStrategy
  /** 基础延迟（ms，默认 1000） */
  baseDelay?: number
  /** 最大延迟（ms，默认 30000） */
  maxDelay?: number
}

/** 插件暴露的 API */
export interface SubmitRetryPluginAPI {
  /** 带重试的提交 */
  submit: (
    onSubmit: (values: Record<string, unknown>) => Promise<void>,
    config?: RetryConfig,
  ) => Promise<SubmitResult>
  /** 创建带超时的提交函数 */
  withTimeout: <V>(
    onSubmit: (values: V) => Promise<void>,
    timeoutMs: number,
  ) => (values: V) => Promise<void>
}

/** 默认配置 */
const DEFAULTS = {
  maxRetries: 3,
  strategy: 'exponential' as RetryStrategy,
  baseDelay: 1000,
  maxDelay: 30000,
}

/** 计算重试延迟 */
function calculateDelay(
  attempt: number,
  strategy: RetryStrategy,
  baseDelay: number,
  maxDelay: number,
): number {
  let delay: number
  switch (strategy) {
    case 'fixed':
      delay = baseDelay
      break
    case 'linear':
      delay = baseDelay * attempt
      break
    case 'exponential':
    default:
      delay = 2 ** (attempt - 1) * baseDelay
      delay += Math.random() * baseDelay * 0.1
      break
  }
  return Math.min(delay, maxDelay)
}

/** 异步延迟（支持 AbortSignal 取消） */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('重试已取消', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('重试已取消', 'AbortError'))
    }, { once: true })
  })
}

/** 插件名称 */
export const PLUGIN_NAME = 'submit-retry'

/**
 * 提交重试插件
 *
 * 封装 form.submit()，提供自动重试和超时控制。
 * 支持固定/指数退避/线性递增重试策略。
 *
 * @param pluginConfig - 默认重试配置（可在每次 submit 时覆盖）
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { submitRetryPlugin, type SubmitRetryPluginAPI } from '@moluoxixi/plugin-submit-retry'
 *
 * const form = createForm({
 *   plugins: [submitRetryPlugin({ maxRetries: 3 })],
 * })
 *
 * const retry = form.getPlugin<SubmitRetryPluginAPI>('submit-retry')!
 * await retry.submit(async (values) => {
 *   await api.post('/save', values)
 * })
 * ```
 */
export function submitRetryPlugin(pluginConfig: SubmitRetryPluginConfig = {}): FormPlugin<SubmitRetryPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, _context: PluginContext): PluginInstallResult<SubmitRetryPluginAPI> {
      const api: SubmitRetryPluginAPI = {
        async submit(
          onSubmit: (values: Record<string, unknown>) => Promise<void>,
          config: RetryConfig = {},
        ): Promise<SubmitResult> {
          const maxRetries = config.maxRetries ?? pluginConfig.maxRetries ?? DEFAULTS.maxRetries
          const strategy = config.strategy ?? pluginConfig.strategy ?? DEFAULTS.strategy
          const baseDelay = config.baseDelay ?? pluginConfig.baseDelay ?? DEFAULTS.baseDelay
          const maxDelay = config.maxDelay ?? pluginConfig.maxDelay ?? DEFAULTS.maxDelay
          const retryOnValidationFailure = config.retryOnValidationFailure ?? false
          const { onBeforeRetry, onRetrySuccess, onRetriesExhausted, signal } = config

          /* 第一次提交 */
          const result = await form.submit()

          /* 验证失败 */
          if (result.errors.length > 0 && !retryOnValidationFailure) {
            return result
          }

          /* 验证通过，执行提交回调 */
          let lastError: Error | null = null

          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            if (signal?.aborted) {
              throw new DOMException('提交已取消', 'AbortError')
            }

            try {
              if (attempt > 0) {
                const delay = calculateDelay(attempt, strategy, baseDelay, maxDelay)
                await sleep(delay, signal)

                if (onBeforeRetry) {
                  const shouldRetry = await onBeforeRetry(attempt, lastError!)
                  if (!shouldRetry) {
                    throw lastError ?? new Error('重试被用户取消')
                  }
                }
              }

              await onSubmit(result.values as Record<string, unknown>)

              if (attempt > 0) {
                onRetrySuccess?.(attempt, result)
              }
              return result
            }
            catch (err) {
              if (err instanceof DOMException && err.name === 'AbortError')
                throw err
              lastError = err instanceof Error ? err : new Error(String(err))

              if (attempt === maxRetries) {
                onRetriesExhausted?.(lastError)
                throw lastError
              }
            }
          }

          throw lastError ?? new Error('提交失败')
        },

        withTimeout<V>(
          onSubmit: (values: V) => Promise<void>,
          timeoutMs: number,
        ): (values: V) => Promise<void> {
          return async (values: V): Promise<void> => {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), timeoutMs)
            try {
              await Promise.race([
                onSubmit(values),
                new Promise<never>((_, reject) => {
                  controller.signal.addEventListener('abort', () => {
                    reject(new Error(`提交超时（${timeoutMs}ms）`))
                  }, { once: true })
                }),
              ])
            }
            finally {
              clearTimeout(timer)
            }
          }
        },
      }

      return { api }
    },
  }
}
