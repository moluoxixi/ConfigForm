import type { DataSourceItem } from '../shared'
import type { DataSourceConfig, RequestAdapter, RequestConfig } from '../types'
import { FormPath, isArray, isFunction, isObject, isString, logger } from '../shared'

/** 请求适配器注册表 */
const adapterRegistry = new Map<string, RequestAdapter>()

/** 数据源缓存 */
const cache = new Map<string, { data: DataSourceItem[], timestamp: number }>()

/** 正在进行的请求去重表（相同 cacheKey 复用同一个 Promise） */
const pendingRequests = new Map<string, Promise<DataSourceItem[]>>()

/** 默认缓存有效期（ms） */
const DEFAULT_CACHE_TTL = 60000
/** 缓存 key 分隔符 */
const CACHE_KEY_SEPARATOR = '::'

/** 默认请求适配器（fetch） */
const defaultAdapter: RequestAdapter = {
  /**
   * request：执行当前位置的功能逻辑。
   * 定位：`packages/core/src/datasource/manager.ts:21`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param config 参数 config 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const { url, method, params, headers, signal } = config
    let finalUrl = url

    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      }
      const qs = searchParams.toString()
      if (qs) {
        finalUrl += (url.includes('?') ? '&' : '?') + qs
      }
    }

    /**
     * 请求头：GET 不发送 Content-Type（无 body），
     * POST 默认 application/json。
     */
    const requestHeaders: Record<string, string> = { ...headers }
    if (method === 'POST') {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] ?? 'application/json'
    }

    const response = await fetch(finalUrl, {
      method,
      headers: requestHeaders,
      body: method === 'POST' && params ? JSON.stringify(params) : undefined,
      signal,
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  },
}

/** 注册请求适配器 */
export function registerRequestAdapter(name: string, adapter: RequestAdapter): void {
  adapterRegistry.set(name, adapter)
}

/** 获取请求适配器 */
function getAdapter(name?: string): RequestAdapter {
  if (name) {
    const adapter = adapterRegistry.get(name)
    if (!adapter) {
      throw new Error(`[ConfigForm] 请求适配器 "${name}" 未注册`)
    }
    return adapter
  }
  return defaultAdapter
}

/**
 * 生成缓存 key
 *
 * 对 method / url / adapter / headers / params 做稳定序列化，
 * 避免参数顺序、header 大小写等导致缓存不命中或冲突。
 */
function buildCacheKey(config: DataSourceConfig, resolvedParams: Record<string, unknown>): string {
  const method = (config.method ?? 'GET').toUpperCase()
  const adapter = config.requestAdapter ?? 'default'
  const headers = normalizeHeaders(config.headers)
  return [
    method,
    config.url ?? '',
    adapter,
    stableStringify(headers),
    stableStringify(resolvedParams),
  ].join(CACHE_KEY_SEPARATOR)
}

/**
 * normalize Headers：负责“规范化normalize Headers”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Headers 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) {
    return {}
  }
  const normalized: Record<string, string> = {}
  for (const key of Object.keys(headers).sort()) {
    normalized[key.toLowerCase()] = headers[key]
  }
  return normalized
}

/**
 * stable Normalize：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 stable Normalize 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function stableNormalize(
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown {
  if (isArray(value)) {
    return value.map(item => stableNormalize(item, seen))
  }
  if (!isObject(value)) {
    return value
  }

  const obj = value as Record<string, unknown>
  if (seen.has(obj)) {
    return '[Circular]'
  }
  seen.add(obj)

  const normalized: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) {
    normalized[key] = stableNormalize(obj[key], seen)
  }
  seen.delete(obj)
  return normalized
}

/**
 * stable Stringify：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 stable Stringify 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function stableStringify(value: unknown): string {
  const serialized = JSON.stringify(stableNormalize(value))
  return serialized ?? 'null'
}

/**
 * get Cache Key Url：负责“获取get Cache Key Url”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 get Cache Key Url 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function getCacheKeyUrl(cacheKey: string): string {
  const parts = cacheKey.split(CACHE_KEY_SEPARATOR)
  return parts[1] ?? ''
}

/**
 * create Abort Error：负责“创建create Abort Error”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Abort Error 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createAbortError(): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('The operation was aborted.', 'AbortError')
  }
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

/**
 * 解析参数（将字段路径引用转为实际值）
 */
function resolveParams(
  params: DataSourceConfig['params'],
  values: Record<string, unknown>,
): Record<string, unknown> {
  if (!params)
    return {}
  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (isFunction(value)) {
      resolved[key] = value(values)
    }
    else if (isString(value) && value.startsWith('$values.')) {
      /* 路径引用语法：$values.province → FormPath.getIn(values, 'province') */
      const path = value.slice(8)
      resolved[key] = path ? FormPath.getIn(values, path) : undefined
    }
    else {
      resolved[key] = value
    }
  }
  return resolved
}

/**
 * 转换响应数据为标准 DataSourceItem
 */
function transformResponse(
  data: unknown,
  config: DataSourceConfig,
): DataSourceItem[] {
  /* 用户自定义转换 */
  if (config.transform) {
    return config.transform(data)
  }

  /* 自动字段映射 */
  if (isArray(data)) {
    const labelField = config.labelField ?? 'label'
    const valueField = config.valueField ?? 'value'
    const childrenField = config.childrenField ?? 'children'

    /**
     * 把响应项递归映射为标准 DataSourceItem 结构。
     * @param item 任意响应项。
     * @returns 标准数据源项。
     */
    const mapItem = (item: unknown): DataSourceItem => {
      if (!isObject(item)) {
        return { label: String(item), value: item as string | number | boolean }
      }
      const mapped: DataSourceItem = {
        label: String(item[labelField] ?? ''),
        value: item[valueField] as string | number | boolean,
      }
      const children = item[childrenField]
      if (isArray(children)) {
        mapped.children = children.map(mapItem)
      }
      return mapped
    }

    return data.map(mapItem)
  }

  /* 非数组响应且无自定义转换，输出警告帮助排查配置错误 */
  if (data !== null && data !== undefined) {
    logger.warn('数据源响应不是数组且未配置 transform，返回空列表。请检查 API 响应格式或配置 transform 函数。')
  }

  return []
}

/**
 * 加载远程数据源
 *
 * 特性：
 * - 支持 TTL 缓存
 * - 并发请求去重（相同 URL + 参数只发一次请求）
 * - 支持外部 AbortSignal 取消请求
 *
 * @param config - 数据源配置
 * @param values - 当前表单值（用于解析参数路径引用）
 * @param signal - 可选的取消信号（组件卸载时传入以取消进行中的请求）
 */
export async function fetchDataSource(
  config: DataSourceConfig,
  values: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<DataSourceItem[]> {
  if (!config.url)
    return []
  if (signal?.aborted) {
    throw createAbortError()
  }

  const resolvedParams = resolveParams(config.params, values)
  const cacheKey = buildCacheKey(config, resolvedParams)
  const requestMethod = (config.method ?? 'GET').toUpperCase() as 'GET' | 'POST'
  /**
   * 仅在无 signal 场景启用并发去重。
   * 有 signal 时保留“调用方可独立取消请求”的语义，避免不同调用方互相影响。
   */
  const dedupeEnabled = !signal

  /* 检查缓存 */
  if (config.cache) {
    const cached = cache.get(cacheKey)
    if (cached) {
      const ttl = isObject(config.cache) ? (config.cache as { ttl: number }).ttl : DEFAULT_CACHE_TTL
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data
      }
      cache.delete(cacheKey)
    }
  }

  if (dedupeEnabled) {
    /* 并发去重：如果已有相同请求在进行中，复用其 Promise */
    const pending = pendingRequests.get(cacheKey)
    if (pending) {
      return pending
    }
  }

  /* 发起请求 */
  const requestPromise = (async () => {
    try {
      const adapter = getAdapter(config.requestAdapter)
      const data = await adapter.request({
        url: config.url!,
        method: requestMethod,
        params: resolvedParams,
        headers: config.headers,
        signal: dedupeEnabled ? undefined : signal,
      })

      const items = transformResponse(data, config)

      /* 写入缓存 */
      if (config.cache) {
        cache.set(cacheKey, { data: items, timestamp: Date.now() })
      }

      return items
    }
    finally {
      /* 无论成功或失败，移除 pending 标记 */
      if (dedupeEnabled) {
        pendingRequests.delete(cacheKey)
      }
    }
  })()

  if (dedupeEnabled) {
    pendingRequests.set(cacheKey, requestPromise)
  }
  return requestPromise
}

/**
 * 清除数据源缓存
 *
 * @param urlPrefix - 可选，只清除以此前缀开头的缓存条目。不传则清除全部。
 */
export function clearDataSourceCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (getCacheKeyUrl(key).startsWith(urlPrefix)) {
      cache.delete(key)
    }
  }
}
