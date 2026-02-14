import type { FormPlugin, PluginInstallResult } from '@moluoxixi/core'
import type { ACLPluginAPI, ACLPluginConfig } from './acl'
import type { DirtyCheckerPluginAPI } from './dirty-checker'
import type { DraftPluginAPI, DraftPluginConfig } from './draft'
import type { HistoryPluginAPI, HistoryPluginConfig } from './history'
import type { MaskingPluginAPI, MaskingPluginConfig } from './masking'
import type { PerfMonitorAPI, PerfMonitorConfig } from './perf-monitor'
import type { SubFormPluginAPI } from './sub-form'
import type { SubmitRetryPluginAPI, SubmitRetryPluginConfig } from './submit-retry'
import { aclPlugin } from './acl'
import { dirtyCheckerPlugin } from './dirty-checker'
import { draftPlugin } from './draft'
import { historyPlugin } from './history'
import { maskingPlugin } from './masking'
import { perfMonitorPlugin } from './perf-monitor'
import { subFormPlugin } from './sub-form'
import { submitRetryPlugin } from './submit-retry'

/**
 * 低代码聚合插件配置
 *
 * 所有子项均可选，不传则使用默认配置。
 * 设为 false 可禁用对应功能。
 */
export interface LowerCodePluginConfig {
  /**
   * 撤销/重做配置
   *
   * - 不传或 `{}`：启用，使用默认配置（maxLength: 50）
   * - `false`：禁用
   */
  history?: HistoryPluginConfig | false
  /**
   * 脏检查配置
   *
   * - 不传或 `true`：启用
   * - `false`：禁用
   */
  dirtyChecker?: boolean
  /**
   * 草稿保存配置
   *
   * - 不传：禁用（需要 key，无法自动推断）
   * - `{ key: 'xxx' }`：启用
   * - `false`：禁用
   */
  draft?: DraftPluginConfig | false
  /**
   * ACL 权限配置
   *
   * - 不传或 `{}`：启用，默认 full 权限
   * - `false`：禁用
   */
  acl?: ACLPluginConfig | false
  /**
   * 数据脱敏配置
   *
   * - 不传：禁用（需要 rules，无法自动推断）
   * - `{ rules: [...] }`：启用
   * - `false`：禁用
   */
  masking?: MaskingPluginConfig | false
  /**
   * 提交重试配置
   *
   * - 不传或 `{}`：启用，默认 3 次指数退避
   * - `false`：禁用
   */
  submitRetry?: SubmitRetryPluginConfig | false
  /**
   * 子表单配置
   *
   * - 不传或 `true`：启用
   * - `false`：禁用
   */
  subForm?: boolean
  /**
   * 性能监控配置
   *
   * - 不传或 `{}`：启用，使用默认配置（slowThreshold: 100）
   * - `false`：禁用
   */
  perfMonitor?: PerfMonitorConfig | false
}

/**
 * 低代码聚合插件暴露的 API
 *
 * 通过 `form.getPlugin<LowerCodePluginAPI>('lower-code')` 获取，
 * 然后按名称访问各子插件的 API。
 */
export interface LowerCodePluginAPI {
  /** 撤销/重做 API（禁用时为 undefined） */
  readonly history?: HistoryPluginAPI
  /** 脏检查 API（禁用时为 undefined） */
  readonly dirtyChecker?: DirtyCheckerPluginAPI
  /** 草稿保存 API（禁用时为 undefined） */
  readonly draft?: DraftPluginAPI
  /** ACL 权限 API（禁用时为 undefined） */
  readonly acl?: ACLPluginAPI
  /** 数据脱敏 API（禁用时为 undefined） */
  readonly masking?: MaskingPluginAPI
  /** 提交重试 API（禁用时为 undefined） */
  readonly submitRetry?: SubmitRetryPluginAPI
  /** 子表单 API（禁用时为 undefined） */
  readonly subForm?: SubFormPluginAPI
  /** 性能监控 API（禁用时为 undefined） */
  readonly perfMonitor?: PerfMonitorAPI
}

/** 插件名称 */
export const PLUGIN_NAME = 'lower-code'

/**
 * 低代码聚合插件
 *
 * 一键注册所有低代码增强能力：撤销重做、脏检查、草稿保存、
 * ACL 权限、数据脱敏、提交重试、子表单。
 *
 * 每个子功能都可以通过配置项单独开关，不传则使用合理默认值。
 *
 * @param config - 聚合配置（可选，不传则启用默认功能集）
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { lowerCodePlugin, type LowerCodePluginAPI } from '@moluoxixi/plugin-lower-code'
 *
 * // 最简用法：一键注册全部默认功能
 * const form = createForm({
 *   plugins: [lowerCodePlugin()],
 * })
 *
 * // 自定义配置
 * const form2 = createForm({
 *   plugins: [
 *     lowerCodePlugin({
 *       history: { maxLength: 30 },
 *       draft: { key: 'user-form' },
 *       acl: {
 *         roles: [
 *           { role: 'admin', rules: [{ pattern: '*', permission: 'full' }] },
 *         ],
 *       },
 *       masking: {
 *         rules: [{ pattern: 'phone', type: 'phone' }],
 *       },
 *       submitRetry: { maxRetries: 5 },
 *     }),
 *   ],
 * })
 *
 * // 通过聚合 API 访问各子功能
 * const lc = form2.getPlugin<LowerCodePluginAPI>('lower-code')!
 * lc.history?.undo()
 * lc.dirtyChecker?.check()
 * await lc.draft?.restore()
 * ```
 */
export function lowerCodePlugin(config: LowerCodePluginConfig = {}): FormPlugin<LowerCodePluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form, context): PluginInstallResult<LowerCodePluginAPI> {
      const disposers: Array<() => void> = []
      const apis: {
        history?: HistoryPluginAPI
        dirtyChecker?: DirtyCheckerPluginAPI
        draft?: DraftPluginAPI
        acl?: ACLPluginAPI
        masking?: MaskingPluginAPI
        submitRetry?: SubmitRetryPluginAPI
        subForm?: SubFormPluginAPI
        perfMonitor?: PerfMonitorAPI
      } = {}

      /* 安装子插件并收集 API 和 dispose */
      function installChild<API>(
        childPlugin: FormPlugin<API>,
      ): API | undefined {
        const result = childPlugin.install(form, context)
        if (result.dispose)
          disposers.push(result.dispose)
        return result.api
      }

      /* 撤销/重做（默认启用） */
      if (config.history !== false) {
        const childConfig = typeof config.history === 'object' ? config.history : {}
        apis.history = installChild(historyPlugin(childConfig))
      }

      /* 脏检查（默认启用） */
      if (config.dirtyChecker !== false) {
        apis.dirtyChecker = installChild(dirtyCheckerPlugin())
      }

      /* 草稿保存（需要 key，默认不启用） */
      if (config.draft && typeof config.draft === 'object') {
        apis.draft = installChild(draftPlugin(config.draft))
      }

      /* ACL 权限（默认启用） */
      if (config.acl !== false) {
        const childConfig = typeof config.acl === 'object' ? config.acl : {}
        apis.acl = installChild(aclPlugin(childConfig))
      }

      /* 数据脱敏（需要 rules，默认不启用） */
      if (config.masking && typeof config.masking === 'object') {
        apis.masking = installChild(maskingPlugin(config.masking))
      }

      /* 提交重试（默认启用） */
      if (config.submitRetry !== false) {
        const childConfig = typeof config.submitRetry === 'object' ? config.submitRetry : {}
        apis.submitRetry = installChild(submitRetryPlugin(childConfig))
      }

      /* 子表单（默认启用） */
      if (config.subForm !== false) {
        apis.subForm = installChild(subFormPlugin())
      }

      /* 性能监控（默认启用） */
      if (config.perfMonitor !== false) {
        const childConfig = typeof config.perfMonitor === 'object' ? config.perfMonitor : {}
        apis.perfMonitor = installChild(perfMonitorPlugin(childConfig))
      }

      return {
        api: apis as LowerCodePluginAPI,
        dispose(): void {
          for (const dispose of disposers) {
            dispose()
          }
        },
      }
    },
  }
}
