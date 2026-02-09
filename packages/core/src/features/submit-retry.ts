import type { Disposer } from '@moluoxixi/shared'
import type { FormInstance, SubmitResult } from '../types'

/**
 * 重试策略
 *
 * - `fixed`: 固定间隔重试
 * - `exponential`: 指数退避重试
 * - `linear`: 线性递增重试
 */
export type RetryStrategy = 'fixed' | 'exponential' | 'linear'

/** 提交重试配置 */
export interface SubmitRetryConfig {
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

/** 默认配置 */
const DEFAULTS: Required<Pick<SubmitRetryConfig, 'maxRetries' | 'strategy' | 'baseDelay' | 'maxDelay'>> = {
  maxRetries: 3,
  strategy: 'exponential',
  baseDelay: 1000,
  maxDelay: 30000,
}

/**
 * 计算重试延迟
 *
 * @param attempt - 当前重试次数（从 1 开始）
 * @param strategy - 重试策略
 * @param baseDelay - 基础延迟
 * @param maxDelay - 最大延迟上限
 * @returns 延迟毫秒数
 */
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
      /* 2^(attempt-1) * baseDelay + 随机抖动（避免雷群效应） */
      delay = Math.pow(2, attempt - 1) * baseDelay
      delay += Math.random() * baseDelay * 0.1
      break
  }

  return Math.min(delay, maxDelay)
}

/**
 * 异步延迟（支持 AbortSignal 取消）
 */
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

/**
 * 带重试的表单提交
 *
 * 封装 form.submit() + 用户提交回调，提供自动重试能力。
 * 仅对提交回调（onSubmit）的异常进行重试，表单验证失败默认不重试。
 *
 * @param form - 表单实例
 * @param onSubmit - 提交回调（接收验证通过的 values，执行实际提交逻辑）
 * @param config - 重试配置
 * @returns 提交结果
 *
 * @example
 * ```ts
 * const result = await submitWithRetry(
 *   form,
 *   async (values) => {
 *     await api.post('/save', values)
 *   },
 *   {
 *     maxRetries: 3,
 *     strategy: 'exponential',
 *     onBeforeRetry: (attempt) => {
 *       console.log(`第 ${attempt} 次重试...`)
 *       return true
 *     },
 *     onRetriesExhausted: (err) => {
 *       showToast('提交失败，请稍后重试')
 *     },
 *   },
 * )
 * ```
 */
export async function submitWithRetry<Values extends Record<string, unknown> = Record<string, unknown>>(
  form: FormInstance<Values>,
  onSubmit: (values: Values) => Promise<void>,
  config: SubmitRetryConfig = {},
): Promise<SubmitResult<Values>> {
  const {
    maxRetries = DEFAULTS.maxRetries,
    strategy = DEFAULTS.strategy,
    baseDelay = DEFAULTS.baseDelay,
    maxDelay = DEFAULTS.maxDelay,
    retryOnValidationFailure = false,
    onBeforeRetry,
    onRetrySuccess,
    onRetriesExhausted,
    signal,
  } = config

  /* 第一次提交 */
  const result = await form.submit()

  /* 验证失败 */
  if (result.errors.length > 0) {
    if (!retryOnValidationFailure) {
      return result
    }
  }

  /* 验证通过，执行提交回调 */
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    /* 检查取消信号 */
    if (signal?.aborted) {
      throw new DOMException('提交已取消', 'AbortError')
    }

    try {
      if (attempt > 0) {
        /* 重试延迟 */
        const delay = calculateDelay(attempt, strategy, baseDelay, maxDelay)
        await sleep(delay, signal)

        /* 重试前回调 */
        if (onBeforeRetry) {
          const shouldRetry = await onBeforeRetry(attempt, lastError!)
          if (!shouldRetry) {
            throw lastError ?? new Error('重试被用户取消')
          }
        }
      }

      await onSubmit(result.values)

      /* 重试成功 */
      if (attempt > 0) {
        onRetrySuccess?.(attempt, result)
      }

      return result
    }
    catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt === maxRetries) {
        onRetriesExhausted?.(lastError)
        throw lastError
      }
    }
  }

  /* 不可达，TypeScript 满足 */
  throw lastError ?? new Error('提交失败')
}

/**
 * 创建带超时的提交函数
 *
 * 包装 onSubmit 回调，添加超时控制。
 * 超时后自动 abort，配合重试使用。
 *
 * @param onSubmit - 原始提交回调
 * @param timeoutMs - 超时时间（ms）
 * @returns 包装后的提交回调
 */
export function withTimeout<Values>(
  onSubmit: (values: Values) => Promise<void>,
  timeoutMs: number,
): (values: Values) => Promise<void> {
  return async (values: Values): Promise<void> => {
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
}
