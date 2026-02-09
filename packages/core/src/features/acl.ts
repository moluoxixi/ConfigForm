import type { FieldDisplay, FieldPattern } from '@moluoxixi/shared'
import type { FieldInstance, FormInstance } from '../types'
import { FormPath } from '@moluoxixi/shared'

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
 *
 * 定义哪些字段在什么条件下拥有什么权限。
 * 支持精确路径和通配符模式。
 */
export interface PermissionRule {
  /** 字段路径模式（支持 * 通配符，如 'address.*'、'contacts.*.phone'） */
  pattern: string
  /** 权限等级 */
  permission: FieldPermission
}

/**
 * 角色权限配置
 *
 * 按角色维度定义权限规则，支持多角色叠加。
 */
export interface RolePermission {
  /** 角色标识（如 'admin'、'viewer'、'editor'） */
  role: string
  /** 该角色的权限规则列表（按优先级从低到高排列，后面的覆盖前面的） */
  rules: PermissionRule[]
}

/** ACL 管理器配置 */
export interface FormACLConfig {
  /** 默认权限（未匹配到规则时使用，默认 'full'） */
  defaultPermission?: FieldPermission
  /** 角色权限列表 */
  roles?: RolePermission[]
  /** 直接指定权限规则（不走角色体系） */
  rules?: PermissionRule[]
}

/** 权限到字段状态的映射 */
const PERMISSION_STATE_MAP: Record<FieldPermission, {
  display: FieldDisplay
  pattern: FieldPattern
  disabled: boolean
  readOnly: boolean
}> = {
  full: { display: 'visible', pattern: 'editable', disabled: false, readOnly: false },
  edit: { display: 'visible', pattern: 'editable', disabled: false, readOnly: false },
  view: { display: 'visible', pattern: 'readOnly', disabled: false, readOnly: true },
  hidden: { display: 'hidden', pattern: 'editable', disabled: false, readOnly: false },
  none: { display: 'none', pattern: 'editable', disabled: true, readOnly: false },
}

/**
 * 权限等级数值（用于多角色权限合并：取最高权限）
 */
const PERMISSION_LEVEL: Record<FieldPermission, number> = {
  none: 0,
  hidden: 1,
  view: 2,
  edit: 3,
  full: 4,
}

/**
 * 数值到权限的反向映射
 */
const LEVEL_TO_PERMISSION: FieldPermission[] = ['none', 'hidden', 'view', 'edit', 'full']

/**
 * 表单 ACL 管理器
 *
 * 基于角色和规则的字段级权限控制系统。
 *
 * 核心功能：
 * - 支持角色维度的权限定义
 * - 支持通配符字段路径匹配
 * - 多角色取最高权限（OR 逻辑）
 * - 动态切换角色 / 权限
 * - 权限变化自动同步到字段状态
 *
 * @example
 * ```ts
 * const acl = new FormACL({
 *   defaultPermission: 'view',
 *   roles: [
 *     {
 *       role: 'admin',
 *       rules: [
 *         { pattern: '*', permission: 'full' },
 *       ],
 *     },
 *     {
 *       role: 'editor',
 *       rules: [
 *         { pattern: 'title', permission: 'edit' },
 *         { pattern: 'content', permission: 'edit' },
 *         { pattern: 'secret', permission: 'none' },
 *       ],
 *     },
 *   ],
 * })
 *
 * // 应用到表单
 * acl.apply(form, ['editor'])
 *
 * // 切换角色
 * acl.apply(form, ['admin'])
 *
 * // 查询单个字段权限
 * const perm = acl.getFieldPermission('secret', ['editor'])
 * // → 'none'
 * ```
 */
export class FormACL {
  private config: Required<Pick<FormACLConfig, 'defaultPermission'>> & FormACLConfig

  constructor(config: FormACLConfig = {}) {
    this.config = {
      defaultPermission: config.defaultPermission ?? 'full',
      ...config,
    }
  }

  /**
   * 获取指定字段在给定角色下的权限
   *
   * 多角色时取最高权限（OR 合并），
   * 同角色内后定义的规则覆盖先定义的。
   *
   * @param fieldPath - 字段路径
   * @param activeRoles - 当前激活的角色列表
   * @returns 最终权限等级
   */
  getFieldPermission(fieldPath: string, activeRoles: string[]): FieldPermission {
    let maxLevel = -1

    /* 角色维度的规则 */
    if (this.config.roles) {
      for (const rolePerm of this.config.roles) {
        if (!activeRoles.includes(rolePerm.role)) continue
        const roleLevel = this.resolvePermissionLevel(fieldPath, rolePerm.rules)
        if (roleLevel > maxLevel) maxLevel = roleLevel
      }
    }

    /* 直接规则（非角色维度），与角色规则取最高 */
    if (this.config.rules) {
      const directLevel = this.resolvePermissionLevel(fieldPath, this.config.rules)
      if (directLevel > maxLevel) maxLevel = directLevel
    }

    /* 无任何匹配规则，使用默认权限 */
    if (maxLevel === -1) {
      return this.config.defaultPermission
    }

    return LEVEL_TO_PERMISSION[maxLevel] ?? this.config.defaultPermission
  }

  /**
   * 将权限应用到表单
   *
   * 遍历所有已注册字段，根据权限规则设置字段状态。
   *
   * @param form - 表单实例
   * @param activeRoles - 当前激活的角色列表
   */
  apply(form: FormInstance, activeRoles: string[]): void {
    form.batch(() => {
      const allFields = form.getAllFields()
      for (const [path, field] of allFields) {
        const permission = this.getFieldPermission(path, activeRoles)
        this.applyPermissionToField(field as unknown as FieldInstance, permission)
      }
    })
  }

  /**
   * 动态添加权限规则
   *
   * @param rules - 要添加的规则
   */
  addRules(rules: PermissionRule[]): void {
    if (!this.config.rules) this.config.rules = []
    this.config.rules.push(...rules)
  }

  /**
   * 动态添加角色权限
   *
   * @param rolePermission - 角色权限配置
   */
  addRole(rolePermission: RolePermission): void {
    if (!this.config.roles) this.config.roles = []
    /* 同名角色合并规则 */
    const existing = this.config.roles.find(r => r.role === rolePermission.role)
    if (existing) {
      existing.rules.push(...rolePermission.rules)
    }
    else {
      this.config.roles.push(rolePermission)
    }
  }

  /**
   * 移除角色
   *
   * @param role - 角色标识
   */
  removeRole(role: string): void {
    if (!this.config.roles) return
    this.config.roles = this.config.roles.filter(r => r.role !== role)
  }

  /**
   * 从规则列表中解析字段的权限等级
   *
   * 遍历规则列表（按定义顺序），最后匹配的规则胜出。
   * 返回权限数值（-1 表示无匹配）。
   */
  private resolvePermissionLevel(fieldPath: string, rules: PermissionRule[]): number {
    let level = -1
    for (const rule of rules) {
      if (FormPath.match(rule.pattern, fieldPath)) {
        level = PERMISSION_LEVEL[rule.permission]
      }
    }
    return level
  }

  /**
   * 将权限等级应用到单个字段
   */
  private applyPermissionToField(field: FieldInstance, permission: FieldPermission): void {
    const state = PERMISSION_STATE_MAP[permission]
    ;(field as { display: FieldDisplay }).display = state.display
    field.pattern = state.pattern
    field.disabled = state.disabled
    field.readOnly = state.readOnly
  }
}
