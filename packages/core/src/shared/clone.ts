interface BufferLikeCtor {
  isBuffer: (value: unknown) => boolean
  from: (value: unknown) => unknown
}

type SeenMap = WeakMap<object, unknown>

/**
 * clone Reg Exp：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Reg Exp 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneRegExp(source: RegExp): RegExp {
  const cloned = new RegExp(source.source, source.flags)
  cloned.lastIndex = source.lastIndex
  return cloned
}

/**
 * clone Data View：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Data View 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneDataView(source: DataView, seen: SeenMap): DataView {
  const clonedBuffer = cloneDeep(source.buffer, seen) as ArrayBuffer
  return new DataView(clonedBuffer, source.byteOffset, source.byteLength)
}

function cloneTypedArray<T extends ArrayBufferView>(source: T, seen: SeenMap): T {
  const clonedBuffer = cloneDeep(source.buffer, seen) as ArrayBuffer
  const Ctor = source.constructor as new (
    buffer: ArrayBufferLike,
    byteOffset?: number,
    length?: number,
  ) => T

  if ('length' in source && typeof source.length === 'number') {
    return new Ctor(clonedBuffer, source.byteOffset, source.length)
  }
  return new Ctor(clonedBuffer, source.byteOffset)
}

/**
 * clone Error：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Error 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneError(source: Error): Error {
  const Ctor = source.constructor as new (message?: string) => Error
  const cloned = new Ctor(source.message)
  cloned.name = source.name
  if ('stack' in source)
    cloned.stack = source.stack
  return cloned
}

/**
 * 深拷贝（支持循环引用和常见内建类型）
 *
 * 支持类型：
 * - Object / Array（保留原型、属性描述符、symbol key）
 * - Date / RegExp / Error
 * - Map / Set
 * - ArrayBuffer / DataView / TypedArray
 * - URL / URLSearchParams / Blob / File（运行环境支持时）
 * - Buffer（Node 环境支持时）
 *
 * 对 Promise / WeakMap / WeakSet 等不可遍历对象返回原引用。
 */
export function cloneDeep<T>(source: T, seen: SeenMap = new WeakMap<object, unknown>()): T {
  if (source === null || typeof source !== 'object')
    return source

  const sourceObject = source as object
  const cached = seen.get(sourceObject)
  if (cached !== undefined)
    return cached as T

  const g = globalThis as typeof globalThis & {
    ['Buffer']?: BufferLikeCtor
    File?: new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) => File
  }

  const bufferKey = 'Buffer' as const
  const bufferCtor = g[bufferKey]
  if (bufferCtor?.isBuffer(source)) {
    const cloned = bufferCtor.from(source)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof Date) {
    const cloned = new Date(source.getTime())
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof RegExp) {
    const cloned = cloneRegExp(source)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof Map) {
    const cloned = new Map<unknown, unknown>()
    seen.set(sourceObject, cloned)
    for (const [key, value] of source.entries()) {
      cloned.set(cloneDeep(key, seen), cloneDeep(value, seen))
    }
    return cloned as T
  }

  if (source instanceof Set) {
    const cloned = new Set<unknown>()
    seen.set(sourceObject, cloned)
    for (const value of source.values()) {
      cloned.add(cloneDeep(value, seen))
    }
    return cloned as T
  }

  if (source instanceof ArrayBuffer) {
    const cloned = source.slice(0)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (ArrayBuffer.isView(source)) {
    const cloned = source instanceof DataView
      ? cloneDataView(source, seen)
      : cloneTypedArray(source, seen)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof Error) {
    const cloned = cloneError(source)
    seen.set(sourceObject, cloned)
    for (const key of Reflect.ownKeys(source)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key)
      if (!descriptor || !('value' in descriptor))
        continue
      descriptor.value = cloneDeep(descriptor.value, seen)
      Object.defineProperty(cloned, key, descriptor)
    }
    return cloned as T
  }

  if (typeof URL !== 'undefined' && source instanceof URL) {
    const cloned = new URL(source.toString())
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (typeof URLSearchParams !== 'undefined' && source instanceof URLSearchParams) {
    const cloned = new URLSearchParams(source.toString())
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (typeof Blob !== 'undefined' && source instanceof Blob) {
    const cloned = source.slice(0, source.size, source.type)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (typeof g.File !== 'undefined' && source instanceof g.File) {
    const cloned = new g.File([source], source.name, { type: source.type, lastModified: source.lastModified })
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof WeakMap || source instanceof WeakSet || source instanceof Promise)
    return source

  const cloned = Array.isArray(source)
    ? Array.from({ length: source.length })
    : Object.create(Object.getPrototypeOf(source))
  seen.set(sourceObject, cloned)

  for (const key of Reflect.ownKeys(sourceObject)) {
    const descriptor = Object.getOwnPropertyDescriptor(sourceObject, key)
    if (!descriptor)
      continue
    if ('value' in descriptor)
      descriptor.value = cloneDeep(descriptor.value, seen)
    Object.defineProperty(cloned, key, descriptor)
  }
  return cloned as T
}

export const deepClone = cloneDeep
