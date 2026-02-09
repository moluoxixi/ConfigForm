/**
 * 通用 Diff 算法
 *
 * 深度对比两个值，返回结构化的差异信息。
 * 支持基本类型、对象、数组、Date、RegExp。
 */

/* ======================== 类型定义 ======================== */

/** Diff 条目类型 */
export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

/** 单个字段的 Diff 结果 */
export interface DiffEntry {
  /** 字段路径 */
  path: string
  /** 差异类型 */
  type: DiffType
  /** 旧值（removed/changed 时有值） */
  oldValue?: unknown
  /** 新值（added/changed 时有值） */
  newValue?: unknown
}

/** 完整的 Diff 结果 */
export interface DiffResult {
  /** 所有差异条目 */
  entries: DiffEntry[]
  /** 是否有任何差异 */
  hasDiff: boolean
  /** 新增的字段路径 */
  added: DiffEntry[]
  /** 删除的字段路径 */
  removed: DiffEntry[]
  /** 变更的字段路径 */
  changed: DiffEntry[]
}

/** 字段级 Diff 视图（用于 UI 展示） */
export interface DiffFieldView {
  /** 字段路径 */
  path: string
  /** 旧值 */
  oldValue: unknown
  /** 新值 */
  newValue: unknown
  /** 是否有差异 */
  dirty: boolean
  /** 差异类型 */
  type: DiffType
}

/* ======================== 核心函数 ======================== */

/**
 * 深度比较两个值是否相等
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (a === undefined || b === undefined) return false

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString()
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>

  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)

  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false
    if (!deepEqual(aObj[key], bObj[key])) return false
  }

  return true
}

/**
 * 计算两个对象之间的深度 Diff
 *
 * @param oldValues - 旧值（对比基准）
 * @param newValues - 新值
 * @param basePath - 路径前缀（用于递归）
 * @returns 结构化的 Diff 结果
 */
export function diff(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  basePath = '',
): DiffResult {
  const entries: DiffEntry[] = []

  collectDiff(oldValues, newValues, basePath, entries)

  return {
    entries,
    hasDiff: entries.some(e => e.type !== 'unchanged'),
    added: entries.filter(e => e.type === 'added'),
    removed: entries.filter(e => e.type === 'removed'),
    changed: entries.filter(e => e.type === 'changed'),
  }
}

/**
 * 生成字段级别的 Diff 视图
 *
 * 用于 UI 展示，为指定的字段路径列表生成对比数据。
 *
 * @param oldValues - 旧值
 * @param newValues - 新值
 * @param paths - 要对比的字段路径列表（不传则对比所有叶子节点）
 */
export function getDiffView(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  paths?: string[],
): DiffFieldView[] {
  if (paths) {
    return paths.map(path => {
      const oldVal = getNestedValue(oldValues, path)
      const newVal = getNestedValue(newValues, path)
      const dirty = !deepEqual(oldVal, newVal)

      let type: DiffType = 'unchanged'
      if (dirty) {
        if (oldVal === undefined) type = 'added'
        else if (newVal === undefined) type = 'removed'
        else type = 'changed'
      }

      return { path, oldValue: oldVal, newValue: newVal, dirty, type }
    })
  }

  /* 无指定路径：收集所有叶子节点 */
  const result = diff(oldValues, newValues)
  return result.entries.map(entry => ({
    path: entry.path,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    dirty: entry.type !== 'unchanged',
    type: entry.type,
  }))
}

/* ======================== 内部辅助 ======================== */

/** 递归收集差异 */
function collectDiff(
  oldObj: unknown,
  newObj: unknown,
  path: string,
  entries: DiffEntry[],
): void {
  /* 两个都是对象：递归比较 */
  if (
    oldObj !== null && newObj !== null
    && typeof oldObj === 'object' && typeof newObj === 'object'
    && !Array.isArray(oldObj) && !Array.isArray(newObj)
    && !(oldObj instanceof Date) && !(newObj instanceof Date)
  ) {
    const oldRecord = oldObj as Record<string, unknown>
    const newRecord = newObj as Record<string, unknown>
    const allKeys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)])

    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key
      const hasOld = Object.prototype.hasOwnProperty.call(oldRecord, key)
      const hasNew = Object.prototype.hasOwnProperty.call(newRecord, key)

      if (hasOld && !hasNew) {
        entries.push({ path: childPath, type: 'removed', oldValue: oldRecord[key] })
      }
      else if (!hasOld && hasNew) {
        entries.push({ path: childPath, type: 'added', newValue: newRecord[key] })
      }
      else {
        collectDiff(oldRecord[key], newRecord[key], childPath, entries)
      }
    }
    return
  }

  /* 数组：元素级比较 */
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLen = Math.max(oldObj.length, newObj.length)
    for (let i = 0; i < maxLen; i++) {
      const childPath = path ? `${path}.${i}` : String(i)
      if (i >= oldObj.length) {
        entries.push({ path: childPath, type: 'added', newValue: newObj[i] })
      }
      else if (i >= newObj.length) {
        entries.push({ path: childPath, type: 'removed', oldValue: oldObj[i] })
      }
      else {
        collectDiff(oldObj[i], newObj[i], childPath, entries)
      }
    }
    return
  }

  /* 叶子节点：直接比较 */
  if (deepEqual(oldObj, newObj)) {
    entries.push({ path, type: 'unchanged', oldValue: oldObj, newValue: newObj })
  }
  else {
    entries.push({ path, type: 'changed', oldValue: oldObj, newValue: newObj })
  }
}

/** 根据点分路径获取嵌套值 */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}
