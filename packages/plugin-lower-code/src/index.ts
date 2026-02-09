/**
 * @moluoxixi/plugin-lower-code
 *
 * 低代码增强插件集，为配置化表单提供低代码/可视化编辑器所需的高级能力。
 *
 * 推荐使用 `lowerCodePlugin()` 一键注册所有功能：
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { lowerCodePlugin, type LowerCodePluginAPI } from '@moluoxixi/plugin-lower-code'
 *
 * const form = createForm({
 *   plugins: [lowerCodePlugin()],
 * })
 *
 * const lc = form.getPlugin<LowerCodePluginAPI>('lower-code')!
 * lc.history?.undo()
 * lc.dirtyChecker?.check()
 * ```
 *
 * 也可以单独导入子插件按需注册：
 *
 * @example
 * ```ts
 * import { historyPlugin, draftPlugin } from '@moluoxixi/plugin-lower-code'
 *
 * const form = createForm({
 *   plugins: [
 *     historyPlugin({ maxLength: 30 }),
 *     draftPlugin({ key: 'user-form' }),
 *   ],
 * })
 * ```
 */

/* ======================== 聚合插件（推荐） ======================== */

export { lowerCodePlugin } from './lower-code'
export type { LowerCodePluginAPI, LowerCodePluginConfig } from './lower-code'

/* 撤销/重做 */
export { historyPlugin } from './history'
export type { HistoryPluginAPI, HistoryPluginConfig, HistoryRecord } from './history'

/* 脏检查 */
export { deepEqual, dirtyCheckerPlugin } from './dirty-checker'
export type { DirtyCheckResult, DirtyCheckerPluginAPI, FieldDiff } from './dirty-checker'

/* 草稿保存 */
export { draftPlugin, LocalStorageAdapter, SessionStorageAdapter } from './draft'
export type { DraftPluginAPI, DraftPluginConfig, DraftStorageAdapter } from './draft'

/* ACL 权限 */
export { aclPlugin } from './acl'
export type { ACLPluginAPI, ACLPluginConfig, FieldPermission, PermissionRule, RolePermission } from './acl'

/* 数据脱敏 */
export { maskingPlugin, maskValue } from './masking'
export type { MaskingPluginAPI, MaskingPluginConfig, MaskingRule, MaskingType } from './masking'

/* 提交重试 */
export { submitRetryPlugin } from './submit-retry'
export type { RetryConfig, RetryStrategy, SubmitRetryPluginAPI, SubmitRetryPluginConfig } from './submit-retry'

/* 子表单 */
export { SubFormManager, subFormPlugin } from './sub-form'
export type { SubFormConfig, SubFormPluginAPI, SyncMode } from './sub-form'
