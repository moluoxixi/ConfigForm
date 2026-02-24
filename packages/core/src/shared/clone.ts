/**
 * Node.js Buffer 构造器的最小能力抽象。
 * 这里只声明当前模块真正会用到的两个能力：
 * 1. 判断输入是否为 Buffer。
 * 2. 基于输入创建新的 Buffer 副本。
 */
interface BufferLikeCtor {
  isBuffer: (value: unknown) => boolean
  from: (value: unknown) => unknown
}

/**
 * 深拷贝过程中的循环引用缓存表。
 * key 是原对象，value 是已经创建好的克隆对象。
 */
type SeenMap = WeakMap<object, unknown>

/**
 * 克隆 RegExp 实例，并保留匹配游标位置。
 * @param source 原始正则对象。
 * @returns 新的 RegExp 对象，source 与 flags 与原对象一致。
 */
function cloneRegExp(source: RegExp): RegExp {
  const cloned = new RegExp(source.source, source.flags)
  // lastIndex 影响全局/粘性正则的下一次匹配位置，必须一并复制。
  cloned.lastIndex = source.lastIndex
  return cloned
}

/**
 * 克隆 DataView。
 * DataView 依赖底层 ArrayBuffer，因此先克隆 buffer，再复用偏移量和长度重建视图。
 * @param source 原始 DataView。
 * @param seen 循环引用缓存表。
 * @returns 新的 DataView 实例。
 */
function cloneDataView(source: DataView, seen: SeenMap): DataView {
  const clonedBuffer = cloneDeep(source.buffer, seen) as ArrayBuffer
  return new DataView(clonedBuffer, source.byteOffset, source.byteLength)
}

/**
 * 克隆 TypedArray（如 Uint8Array、Float32Array 等）。
 * @param source 原始 TypedArray。
 * @param seen 循环引用缓存表。
 * @returns 与 source 同构的 TypedArray 副本。
 */
function cloneTypedArray<T extends ArrayBufferView>(source: T, seen: SeenMap): T {
  const clonedBuffer = cloneDeep(source.buffer, seen) as ArrayBuffer
  const Ctor = source.constructor as new (
    buffer: ArrayBufferLike,
    byteOffset?: number,
    length?: number,
  ) => T

  // TypedArray 支持 length 参数；DataView 不支持，所以这里做一次特征分支。
  if ('length' in source && typeof source.length === 'number') {
    return new Ctor(clonedBuffer, source.byteOffset, source.length)
  }
  return new Ctor(clonedBuffer, source.byteOffset)
}

/**
 * 克隆 Error 对象。
 * @param source 原始错误对象。
 * @returns 新的 Error 实例，保留 message/name/stack。
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
 * 深拷贝工具函数（支持循环引用与常见内建对象）。
 *
 * 当前策略：
 * 1. 原始值直接返回。
 * 2. 通过 seen 处理循环引用。
 * 3. 对内建对象走专门分支，避免语义丢失。
 * 4. 普通对象按原型与属性描述符逐项复制。
 *
 * 注意：
 * Promise / WeakMap / WeakSet 等对象不可稳定遍历，这里返回原引用。
 *
 * @param source 待克隆的任意值。
 * @param seen 循环引用缓存表，外部通常不需要手动传入。
 * @returns 克隆后的值；若不支持深拷贝则按设计返回原值。
 */
export function cloneDeep<T>(source: T, seen: SeenMap = new WeakMap<object, unknown>()): T {
  // 原始值与 null 没有可克隆的内部结构，直接返回可避免无意义开销。
  if (source === null || typeof source !== 'object')
    return source

  const sourceObject = source as object
  const cached = seen.get(sourceObject)
  // 命中缓存说明出现循环引用，直接复用已创建的克隆对象。
  if (cached !== undefined)
    return cached as T

  const g = globalThis as typeof globalThis & {
    ['Buffer']?: BufferLikeCtor
    File?: new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) => File
  }

  const bufferKey = 'Buffer' as const
  const bufferCtor = g[bufferKey]
  if (bufferCtor?.isBuffer(source)) {
    // Buffer 在 Node 环境下需要用 Buffer.from 保证语义一致。
    const cloned = bufferCtor.from(source)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (source instanceof Date) {
    // Date 语义只依赖时间戳，直接复制毫秒值即可。
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
    // Map 的 key/value 都可能是引用类型，必须递归克隆。
    const cloned = new Map<unknown, unknown>()
    seen.set(sourceObject, cloned)
    for (const [key, value] of source.entries()) {
      cloned.set(cloneDeep(key, seen), cloneDeep(value, seen))
    }
    return cloned as T
  }

  if (source instanceof Set) {
    // Set 元素可能是对象，需要递归克隆后再写入新集合。
    const cloned = new Set<unknown>()
    seen.set(sourceObject, cloned)
    for (const value of source.values()) {
      cloned.add(cloneDeep(value, seen))
    }
    return cloned as T
  }

  if (source instanceof ArrayBuffer) {
    // ArrayBuffer 可以通过 slice 直接复制底层字节。
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
    // Error 既有标准字段，也可能携带自定义字段，这里统一按属性描述符复制。
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
    // URL 可通过序列化字符串完全重建。
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
    // Blob 的 slice 会返回数据等价的新实例。
    const cloned = source.slice(0, source.size, source.type)
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  if (typeof g.File !== 'undefined' && source instanceof g.File) {
    // File 需要保留文件名、类型与最后修改时间。
    const cloned = new g.File([source], source.name, { type: source.type, lastModified: source.lastModified })
    seen.set(sourceObject, cloned)
    return cloned as T
  }

  // 这些对象要么不可枚举内部结构，要么克隆代价与收益不匹配，按原引用返回。
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

/**
 * cloneDeep 的语义化别名，兼容不同调用方命名习惯。
 */
export const deepClone = cloneDeep
