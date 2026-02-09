import type { FieldDisplay, FieldPattern } from '@moluoxixi/core'
import type { FieldInstance, FormInstance, FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'

/**
 * 字段权限等级
 *
 * 由高到低：
 * - `full`: 完全控制（可编辑、可见）
 * - `edit`: 可编辑
 * - `view`: 只读查看
 * - `hidden`: 隐藏但保留数据
 * - `none`: 无权限（隐藏且排除数据）
 */
export type FieldPermission = 'full' | 'edit' | 'view' | 'hidden' | 'none'

/**
 * 单条权限规则
 */
export interface PermissionRule {
  /** 字段路径模式（支持 * 通配符，如 'address.*'、'contacts.*.phone'） */
  pattern: string
  /** 权限等级 */
  permission: FieldPermission
}

/**
 * 角色权限配置
 */
export interface RolePermission {
  /** 角色标识（如 'admin'、'viewer'、'editor'） */
  role: string
  /** 该角色的权限规则列表（按优先级从低到高排列，后面的覆盖前面的） */
  rules: PermissionRule[]
}

/** 插件配置 */
export interface ACLPluginConfig {
  /** 默认权限（未匹配到规则时使用，默认 'full'） */
  defaultPermission?: FieldPermission
  /** 角色权限列表 */
  roles?: RolePermission[]
  /** 直接指定权限规则（不走角色体系） */
  rules?: PermissionRule[]
}

/** 插件暴露的 API */
export interface ACLPluginAPI {
  /** 应用权限到表单 */
  apply: (activeRoles: string[]) => void
  /** 获取字段权限 */
  getFieldPermission: (fieldPath: string, activeRoles: string[]) => FieldPermission
  /** 动态添加规则 */
  addRules: (rules: PermissionRule[]) => void
  /** 动态添加角色 */
  addRole: (rolePermission: RolePermission) => void
  /** 移除角色 */
  removeRole: (role: string) => void
}

/** 权限到字段状态的映射 */
const PERMISSION_STATE_MAP: Record<FieldPermission, {
  display: FieldDisplay
  pattern: FieldPattern
  disabled: boolean
  preview: boolean
}> = {
  full: { display: 'visible', pattern: 'editable', disabled: false, preview: false },
  edit: { display: 'visible', pattern: 'editable', disabled: false, preview: false },
  view: { display: 'visible', pattern: 'preview', disabled: false, preview: true },
  hidden: { display: 'hidden', pattern: 'editable', disabled: false, preview: false },
  none: { display: 'none', pattern: 'editable', disabled: true, preview: false },
}

/** 权限等级数值（用于多角色权限合并：取最高权限） */
const PERMISSION_LEVEL: Record<FieldPermission, number> = {
  none: 0,
  hidden: 1,
  view: 2,
  edit: 3,
  full: 4,
}

/** 数值到权限的反向映射 */
const LEVEL_TO_PERMISSION: FieldPermission[] = ['none', 'hidden', 'view', 'edit', 'full']

/** 插件名称 */
export const PLUGIN_NAME = 'acl'

/**
 * ACL 权限插件
 *
 * 基于角色和规则的字段级权限控制系统。
 * 支持通配符路径匹配、多角色权限合并（取最高）。
 *
 * @param config - 插件配置
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { aclPlugin, type ACLPluginAPI } from '@moluoxixi/plugin-acl'
 *
 * const form = createForm({
 *   plugins: [
 *     aclPlugin({
 *       defaultPermission: 'view',
 *       roles: [
 *         { role: 'admin', rules: [{ pattern: '*', permission: 'full' }] },
 *         { role: 'editor', rules: [{ pattern: 'title', permission: 'edit' }] },
 *       ],
 *     }),
 *   ],
 * })
 *
 * const acl = form.getPlugin<ACLPluginAPI>('acl')!
 * acl.apply(['editor'])
 * ```
 */
export function aclPlugin(config: ACLPluginConfig = {}): FormPlugin<ACLPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, { hooks }: PluginContext): PluginInstallResult<ACLPluginAPI> {
      const defaultPermission = config.defaultPermission ?? 'full'
      let roles = config.roles ? [...config.roles] : []
      let directRules = config.rules ? [...config.rules] : []

      /** 从规则列表中解析字段的权限等级 */
      function resolvePermissionLevel(fieldPath: string, rules: PermissionRule[]): number {
        let level = -1
        for (const rule of rules) {
          if (FormPath.match(rule.pattern, fieldPath)) {
            level = PERMISSION_LEVEL[rule.permission]
          }
        }
        return level
      }

      /** 将权限等级应用到单个字段 */
      function applyPermissionToField(field: FieldInstance, permission: FieldPermission): void {
        const state = PERMISSION_STATE_MAP[permission]
        ;(field as { display: FieldDisplay }).display = state.display
        field.pattern = state.pattern
        field.disabled = state.disabled
        field.preview = state.preview
      }

      const api: ACLPluginAPI = {
        apply(activeRoles: string[]): void {
          form.batch(() => {
            const allFields = form.getAllFields()
            for (const [path, field] of allFields) {
              const permission = api.getFieldPermission(path, activeRoles)
              applyPermissionToField(field as unknown as FieldInstance, permission)
            }
          })
        },

        getFieldPermission(fieldPath: string, activeRoles: string[]): FieldPermission {
          let maxLevel = -1

          for (const rolePerm of roles) {
            if (!activeRoles.includes(rolePerm.role)) continue
            const roleLevel = resolvePermissionLevel(fieldPath, rolePerm.rules)
            if (roleLevel > maxLevel) maxLevel = roleLevel
          }

          if (directRules.length > 0) {
            const directLevel = resolvePermissionLevel(fieldPath, directRules)
            if (directLevel > maxLevel) maxLevel = directLevel
          }

          if (maxLevel === -1) return defaultPermission
          return LEVEL_TO_PERMISSION[maxLevel] ?? defaultPermission
        },

        addRules(newRules: PermissionRule[]): void {
          directRules.push(...newRules)
        },

        addRole(rolePermission: RolePermission): void {
          const existing = roles.find(r => r.role === rolePermission.role)
          if (existing) {
            existing.rules.push(...rolePermission.rules)
          }
          else {
            roles.push(rolePermission)
          }
        },

        removeRole(role: string): void {
          roles = roles.filter(r => r.role !== role)
        },
      }

      return { api }
    },
  }
}
