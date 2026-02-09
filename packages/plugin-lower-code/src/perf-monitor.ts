import type { FormPlugin, PluginInstallResult } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'

/* ======================== 类型定义 ======================== */

/** 性能指标 */
export interface PerfMetrics {
  /** 字段总数 */
  fieldCount: number
  /** 联动触发总次数 */
  reactionCount: number
  /** 验证总次数 */
  validateCount: number
  /** 提交总次数 */
  submitCount: number
  /** 最近一次验证耗时（ms） */
  lastValidateTime: number
  /** 最近一次提交耗时（ms） */
  lastSubmitTime: number
  /** 慢联动列表（耗时 > 阈值的联动记录） */
  slowReactions: SlowReaction[]
}

/** 慢联动记录 */
export interface SlowReaction {
  /** 触发源字段 */
  source: string
  /** 目标字段 */
  target: string
  /** 耗时（ms） */
  duration: number
  /** 时间戳 */
  timestamp: number
}

/** perfMonitor 插件配置 */
export interface PerfMonitorConfig {
  /** 慢联动阈值（ms），默认 100 */
  slowThreshold?: number
}

/** perfMonitor 插件 API */
export interface PerfMonitorAPI {
  /** 获取当前性能指标 */
  getMetrics: () => PerfMetrics
  /** 获取慢联动列表 */
  getSlowReactions: (threshold?: number) => SlowReaction[]
  /** 重置所有计数器 */
  reset: () => void
  /** 监听指标变化 */
  onMetric: (callback: (metrics: PerfMetrics) => void) => () => void
}

/* ======================== 插件实现 ======================== */

/**
 * 性能监控插件
 *
 * 通过 Hook 拦截和事件监听收集表单性能指标。
 * 暴露 API 供 DevTools 组件消费。
 */
export function perfMonitorPlugin(config: PerfMonitorConfig = {}): FormPlugin<PerfMonitorAPI> {
  const slowThreshold = config.slowThreshold ?? 100

  return {
    name: 'perf-monitor',
    install(form, { hooks }) {
      const metrics: PerfMetrics = {
        fieldCount: form.getAllFields().size,
        reactionCount: 0,
        validateCount: 0,
        submitCount: 0,
        lastValidateTime: 0,
        lastSubmitTime: 0,
        slowReactions: [],
      }

      const listeners: Array<(metrics: PerfMetrics) => void> = []
      const disposers: Array<() => void> = []

      const notifyListeners = (): void => {
        for (const listener of listeners) {
          listener({ ...metrics })
        }
      }

      /* 拦截验证管线 — 记录耗时 */
      hooks.onValidate(async (ctx, next) => {
        metrics.validateCount++
        const start = performance.now()
        const result = await next()
        metrics.lastValidateTime = Math.round(performance.now() - start)
        notifyListeners()
        return result
      })

      /* 拦截提交管线 — 记录耗时 */
      hooks.onSubmit(async (ctx, next) => {
        metrics.submitCount++
        const start = performance.now()
        const result = await next()
        metrics.lastSubmitTime = Math.round(performance.now() - start)
        notifyListeners()
        return result
      })

      /* 监听字段值变化 — 统计联动触发次数并追踪慢联动 */
      let lastChangeTime = performance.now()
      let lastChangePath = ''
      const d1 = form.on(FormLifeCycle.ON_FIELD_VALUE_CHANGE, (event) => {
        const { path } = event.payload as { path: string, value: unknown }
        const now = performance.now()
        const duration = Math.round(now - lastChangeTime)

        /* 如果两次变化间隔超过阈值，记录为慢联动 */
        if (lastChangePath && duration >= slowThreshold) {
          metrics.slowReactions.push({
            source: lastChangePath,
            target: path,
            duration,
            timestamp: Date.now(),
          })
          /* 只保留最近 50 条慢联动记录 */
          if (metrics.slowReactions.length > 50) {
            metrics.slowReactions.shift()
          }
        }

        metrics.reactionCount++
        lastChangeTime = now
        lastChangePath = path
        notifyListeners()
      })
      disposers.push(d1)

      /* 监听字段创建 — 更新字段数 */
      const d2 = form.on(FormLifeCycle.ON_FIELD_INIT, () => {
        metrics.fieldCount = form.getAllFields().size
        notifyListeners()
      })
      disposers.push(d2)

      const api: PerfMonitorAPI = {
        getMetrics: () => ({ ...metrics }),
        getSlowReactions: (threshold = slowThreshold) =>
          metrics.slowReactions.filter(r => r.duration >= threshold),
        reset: () => {
          metrics.reactionCount = 0
          metrics.validateCount = 0
          metrics.submitCount = 0
          metrics.lastValidateTime = 0
          metrics.lastSubmitTime = 0
          metrics.slowReactions = []
          notifyListeners()
        },
        onMetric: (callback) => {
          listeners.push(callback)
          return () => {
            const idx = listeners.indexOf(callback)
            if (idx !== -1) listeners.splice(idx, 1)
          }
        },
      }

      return {
        api,
        dispose: () => {
          for (const d of disposers) d()
          disposers.length = 0
          listeners.length = 0
        },
      }
    },
  }
}
