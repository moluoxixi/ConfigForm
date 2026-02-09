/* Undo/Redo 时间旅行 */
export { FormHistory } from './history'
export type { FormHistoryConfig, HistoryRecord } from './history'

/* 精确脏检查 */
export { checkDirty, deepEqual, getDiffView, isFieldDirty } from './dirty-checker'
export type { DirtyCheckResult, FieldDiff } from './dirty-checker'

/* 草稿自动保存 */
export { FormDraftManager, LocalStorageAdapter, SessionStorageAdapter } from './draft'
export type { DraftConfig, DraftStorageAdapter } from './draft'

/* 字段级 ACL 权限 */
export { FormACL } from './acl'
export type { FieldPermission, FormACLConfig, PermissionRule, RolePermission } from './acl'

/* 数据脱敏 */
export { createMasker, maskValue, registerMaskingType } from './masking'
export type { MaskingConfig, MaskingRule, MaskingType } from './masking'

/* 提交重试 */
export { submitWithRetry, withTimeout } from './submit-retry'
export type { RetryStrategy, SubmitRetryConfig } from './submit-retry'

/* 子表单 / 表单组合 */
export { createSubForm, SubFormManager } from './sub-form'
export type { SubFormConfig, SyncMode } from './sub-form'
