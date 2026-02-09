import type { FormInstance, FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'

/**
 * 字段级别的 Diff 信息
 */
export interface FieldDiff {
  /** 字段路径 */
  path: string
  /** 初始值 */
  initialValue: unknown
  /** 当前值 */
  currentValue: unknown
  /** 变化类型 */
  type: 'added' | 'removed' | 'changed'
}

/**
 * 表单脏检查结果
 */
export interface DirtyCheckResult {
  /** 表单整体是否脏（有任何变化） */
  isDirty: boolean
  /** 所有脏字段的 Diff 列表 */
  diffs: FieldDiff[]
  /** 脏字段路径集合（快速查询） */
  dirtyPaths: Set<string>
  /** 脏字段数量 */
  dirtyCount: number
}

/** 插件暴露的 API */
export interface DirtyCheckerPluginAPI {
  /** 执行完整脏检查 */
  check: () => DirtyCheckResult
  /** 检查单个字段是否脏 */
  isFieldDirty: (path: string) => boolean
  /** 获取对比视图（适用于 UI 值对比面板） */
  getDiffView: (paths?: string[]) => Record<string, { initial: unknown, current: unknown, dirty: boolean }>
  /** 深度比较两个值是否相等 */
  deepEqual: (a: unknown, b: unknown) => boolean
}

/** 插件名称 */
export const PLUGIN_NAME = 'dirty-checker'

/**
 * 深度比较两个值是否相等
 *
 * 支持：基本类型、对象（递归）、数组（递归）、Date、RegExp、null、undefined。
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (a === undefined || b === undefined) return false
  if (typeof a !== typeof b) return false

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags
  }
  if (typeof a !== 'object') return false

  const objA = a as Record<string, unknown>
  const objB = b as Record<string, unknown>
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false
    if (!deepEqual(objA[key], objB[key])) return false
  }
  return true
}

/**
 * 收集两个对象之间的差异路径
 */
function collectDiffs(
  initial: unknown,
  current: unknown,
  basePath: string,
  diffs: FieldDiff[],
): void {
  if (typeof initial !== 'object' || typeof current !== 'object'
    || initial === null || current === null
    || initial instanceof Date || current instanceof Date
    || initial instanceof RegExp || current instanceof RegExp) {
    if (!deepEqual(initial, current)) {
      diffs.push({
        path: basePath,
        initialValue: initial,
        currentValue: current,
        type: initial === undefined ? 'added' : current === undefined ? 'removed' : 'changed',
      })
    }
    return
  }

  const objInitial = initial as Record<string, unknown>
  const objCurrent = current as Record<string, unknown>
  const allKeys = new Set([...Object.keys(objInitial), ...Object.keys(objCurrent)])

  for (const key of allKeys) {
    const childPath = basePath ? `${basePath}.${key}` : key
    const initialVal = objInitial[key]
    const currentVal = objCurrent[key]

    if (!(key in objInitial)) {
      diffs.push({ path: childPath, initialValue: undefined, currentValue: currentVal, type: 'added' })
    }
    else if (!(key in objCurrent)) {
      diffs.push({ path: childPath, initialValue: initialVal, currentValue: undefined, type: 'removed' })
    }
    else {
      collectDiffs(initialVal, currentVal, childPath, diffs)
    }
  }
}

/**
 * 脏检查插件
 *
 * 深度对比 form.values 与 form.initialValues，
 * 提供字段级 Diff 信息。纯函数，无副作用。
 *
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { dirtyCheckerPlugin, type DirtyCheckerPluginAPI } from '@moluoxixi/plugin-dirty-checker'
 *
 * const form = createForm({
 *   initialValues: { name: '张三' },
 *   plugins: [dirtyCheckerPlugin()],
 * })
 *
 * const checker = form.getPlugin<DirtyCheckerPluginAPI>('dirty-checker')!
 * const result = checker.check()
 * if (result.isDirty) {
 *   console.log('脏字段:', result.diffs)
 * }
 * ```
 */
export function dirtyCheckerPlugin(): FormPlugin<DirtyCheckerPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, _context: PluginContext): PluginInstallResult<DirtyCheckerPluginAPI> {
      const api: DirtyCheckerPluginAPI = {
        check(): DirtyCheckResult {
          const diffs: FieldDiff[] = []
          collectDiffs(form.initialValues, form.values, '', diffs)
          const dirtyPaths = new Set(diffs.map(d => d.path))
          return { isDirty: diffs.length > 0, diffs, dirtyPaths, dirtyCount: diffs.length }
        },

        isFieldDirty(path: string): boolean {
          const currentValue = FormPath.getIn(form.values, path)
          const initialValue = FormPath.getIn(form.initialValues, path)
          return !deepEqual(currentValue, initialValue)
        },

        getDiffView(paths?: string[]): Record<string, { initial: unknown, current: unknown, dirty: boolean }> {
          const result: Record<string, { initial: unknown, current: unknown, dirty: boolean }> = {}
          const targetPaths = paths ?? Array.from(form.getAllFields().keys())
          for (const path of targetPaths) {
            const currentValue = FormPath.getIn(form.values, path)
            const initialValue = FormPath.getIn(form.initialValues, path)
            result[path] = { initial: initialValue, current: currentValue, dirty: !deepEqual(currentValue, initialValue) }
          }
          return result
        },

        deepEqual,
      }

      return { api }
    },
  }
}
