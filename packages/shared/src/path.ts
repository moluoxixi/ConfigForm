import type { PathSegment } from './types'
import { isArray, isNullish, isNumber, isObject, isString } from './is'

/** 路径分隔符正则 */
const PATH_RE = /\[(\d+)\]|\.?([^.[\]]+)/g

/**
 * 表单路径工具类
 * 用于解析、操作嵌套对象的路径
 */
export class FormPath {
  private segments: PathSegment[]

  constructor(path: string | PathSegment[]) {
    this.segments = isArray(path) ? [...path] : FormPath.parse(path)
  }

  /** 解析路径字符串为片段数组 */
  static parse(path: string): PathSegment[] {
    if (!path)
      return []
    const segments: PathSegment[] = []
    let match: RegExpExecArray | null
    PATH_RE.lastIndex = 0
    while ((match = PATH_RE.exec(path)) !== null) {
      if (match[1] !== undefined) {
        segments.push(Number(match[1]))
      }
      else if (match[2] !== undefined) {
        segments.push(match[2])
      }
    }
    return segments
  }

  /** 将片段数组序列化为路径字符串 */
  static stringify(segments: PathSegment[]): string {
    return segments.reduce<string>((result, segment, index) => {
      if (isNumber(segment)) {
        return `${result}[${segment}]`
      }
      return index === 0 ? String(segment) : `${result}.${segment}`
    }, '')
  }

  /** 从嵌套对象中获取值 */
  static getIn<T = unknown>(obj: unknown, path: string): T | undefined {
    if (!path)
      return obj as T
    const segments = FormPath.parse(path)
    let current: unknown = obj
    for (const segment of segments) {
      if (isNullish(current))
        return undefined
      if (isObject(current) || isArray(current)) {
        current = (current as Record<string, unknown>)[segment as string]
      }
      else {
        return undefined
      }
    }
    return current as T
  }

  /** 设置嵌套对象的值 */
  static setIn(obj: Record<string, unknown>, path: string, value: unknown): void {
    if (!path)
      return
    const segments = FormPath.parse(path)
    let current: Record<string, unknown> = obj
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]
      const nextSegment = segments[i + 1]
      const key = String(segment)

      if (isNullish(current[key]) || (!isObject(current[key]) && !isArray(current[key]))) {
        current[key] = isNumber(nextSegment) ? [] : {}
      }
      current = current[key] as Record<string, unknown>
    }
    const lastSegment = segments[segments.length - 1]
    current[String(lastSegment)] = value
  }

  /** 删除嵌套对象的值 */
  static deleteIn(obj: Record<string, unknown>, path: string): void {
    if (!path)
      return
    const segments = FormPath.parse(path)
    let current: unknown = obj
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]
      if (isNullish(current))
        return
      current = (current as Record<string, unknown>)[String(segment)]
    }
    if (isNullish(current))
      return
    const lastSegment = segments[segments.length - 1]
    if (isArray(current) && isNumber(lastSegment)) {
      (current as unknown[]).splice(lastSegment, 1)
    }
    else if (isObject(current)) {
      delete (current as Record<string, unknown>)[String(lastSegment)]
    }
  }

  /** 检查嵌套对象中是否存在指定路径 */
  static existsIn(obj: unknown, path: string): boolean {
    if (!path)
      return true
    const segments = FormPath.parse(path)
    let current: unknown = obj
    for (const segment of segments) {
      if (isNullish(current))
        return false
      const key = String(segment)
      if (isObject(current) && key in current) {
        current = (current as Record<string, unknown>)[key]
      }
      else if (isArray(current) && isNumber(segment)) {
        if (segment < 0 || segment >= current.length)
          return false
        current = current[segment]
      }
      else {
        return false
      }
    }
    return true
  }

  /**
   * 路径模式匹配
   * 支持通配符：* 匹配单层，** 匹配多层
   */
  static match(pattern: string, path: string): boolean {
    const patternSegments = FormPath.parse(pattern)
    const pathSegments = FormPath.parse(path)
    return matchSegments(patternSegments, 0, pathSegments, 0)
  }

  /** 获取父路径 */
  static parent(path: string): string {
    const segments = FormPath.parse(path)
    if (segments.length <= 1)
      return ''
    return FormPath.stringify(segments.slice(0, -1))
  }

  /** 连接两个路径 */
  static join(...paths: string[]): string {
    const allSegments: PathSegment[] = []
    for (const path of paths) {
      if (path) {
        allSegments.push(...FormPath.parse(path))
      }
    }
    return FormPath.stringify(allSegments)
  }

  /** 获取路径的最后一个片段（字段名） */
  static basename(path: string): string {
    const segments = FormPath.parse(path)
    return segments.length > 0 ? String(segments[segments.length - 1]) : ''
  }

  /** 判断 childPath 是否是 parentPath 的子路径 */
  static isChildOf(childPath: string, parentPath: string): boolean {
    if (!parentPath)
      return true
    const childSegments = FormPath.parse(childPath)
    const parentSegments = FormPath.parse(parentPath)
    if (childSegments.length <= parentSegments.length)
      return false
    return parentSegments.every((seg, i) => String(seg) === String(childSegments[i]))
  }

  /** 获取路径深度 */
  static depth(path: string): number {
    return FormPath.parse(path).length
  }

  /** 实例方法 */
  get length(): number {
    return this.segments.length
  }

  toString(): string {
    return FormPath.stringify(this.segments)
  }

  parent(): FormPath {
    return new FormPath(this.segments.slice(0, -1))
  }

  concat(other: string | PathSegment[]): FormPath {
    const otherSegments = isString(other) ? FormPath.parse(other) : other
    return new FormPath([...this.segments, ...otherSegments])
  }

  basename(): string {
    return this.segments.length > 0 ? String(this.segments[this.segments.length - 1]) : ''
  }
}

/** 递归匹配路径片段 */
function matchSegments(
  pattern: PathSegment[],
  pi: number,
  path: PathSegment[],
  ti: number,
): boolean {
  while (pi < pattern.length && ti < path.length) {
    const p = String(pattern[pi])
    if (p === '**') {
      /* ** 匹配零或多层 */
      if (pi === pattern.length - 1)
        return true
      for (let k = ti; k <= path.length; k++) {
        if (matchSegments(pattern, pi + 1, path, k))
          return true
      }
      return false
    }
    if (p === '*' || p === String(path[ti])) {
      pi++
      ti++
    }
    else {
      return false
    }
  }
  /* 处理尾部的 ** */
  while (pi < pattern.length && String(pattern[pi]) === '**') pi++
  return pi === pattern.length && ti === path.length
}
