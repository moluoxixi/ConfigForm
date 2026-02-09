import type { FormInstance } from '../types'
import { FormPath } from '@moluoxixi/shared'

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

/**
 * 深度比较两个值是否相等
 *
 * 支持：基本类型、对象（递归）、数组（递归）、Date、RegExp、null、undefined。
 * 不支持：Map、Set、Symbol 属性等。
 *
 * @param a - 值 A
 * @param b - 值 B
 * @returns 是否深度相等
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
 *
 * 递归遍历对象结构，比较每个叶子节点的值。
 * 对于数组，按索引比较元素。
 *
 * @param initial - 初始值
 * @param current - 当前值
 * @param basePath - 基础路径前缀
 * @param diffs - 差异收集数组
 */
function collectDiffs(
  initial: unknown,
  current: unknown,
  basePath: string,
  diffs: FieldDiff[],
): void {
  /* 基本类型或叶子节点比较 */
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
      /* 当前新增的属性 */
      diffs.push({ path: childPath, initialValue: undefined, currentValue: currentVal, type: 'added' })
    }
    else if (!(key in objCurrent)) {
      /* 当前删除的属性 */
      diffs.push({ path: childPath, initialValue: initialVal, currentValue: undefined, type: 'removed' })
    }
    else {
      /* 递归比较 */
      collectDiffs(initialVal, currentVal, childPath, diffs)
    }
  }
}

/**
 * 执行表单精确脏检查
 *
 * 深度对比 form.values 与 form.initialValues，
 * 返回所有变化字段的详细 Diff 信息。
 *
 * @param form - 表单实例
 * @returns 脏检查结果
 *
 * @example
 * ```ts
 * const result = checkDirty(form)
 * if (result.isDirty) {
 *   console.log(`${result.dirtyCount} 个字段被修改:`)
 *   for (const diff of result.diffs) {
 *     console.log(`  ${diff.path}: ${diff.initialValue} → ${diff.currentValue}`)
 *   }
 * }
 * ```
 */
export function checkDirty(form: FormInstance): DirtyCheckResult {
  const diffs: FieldDiff[] = []
  collectDiffs(form.initialValues, form.values, '', diffs)

  const dirtyPaths = new Set(diffs.map(d => d.path))

  return {
    isDirty: diffs.length > 0,
    diffs,
    dirtyPaths,
    dirtyCount: diffs.length,
  }
}

/**
 * 检查指定字段是否脏
 *
 * @param form - 表单实例
 * @param path - 字段路径
 * @returns 是否脏（值与初始值不同）
 */
export function isFieldDirty(form: FormInstance, path: string): boolean {
  const currentValue = FormPath.getIn(form.values, path)
  const initialValue = FormPath.getIn(form.initialValues, path)
  return !deepEqual(currentValue, initialValue)
}

/**
 * 获取表单值与初始值的对比视图
 *
 * 返回一个对象，key 为字段路径，value 为 { initial, current, dirty }。
 * 适用于 UI 展示值对比面板。
 *
 * @param form - 表单实例
 * @param paths - 要对比的字段路径（不传则对比所有已注册字段）
 * @returns 对比视图
 */
export function getDiffView(
  form: FormInstance,
  paths?: string[],
): Record<string, { initial: unknown, current: unknown, dirty: boolean }> {
  const result: Record<string, { initial: unknown, current: unknown, dirty: boolean }> = {}
  const targetPaths = paths ?? Array.from(form.getAllFields().keys())

  for (const path of targetPaths) {
    const currentValue = FormPath.getIn(form.values, path)
    const initialValue = FormPath.getIn(form.initialValues, path)
    result[path] = {
      initial: initialValue,
      current: currentValue,
      dirty: !deepEqual(currentValue, initialValue),
    }
  }

  return result
}
