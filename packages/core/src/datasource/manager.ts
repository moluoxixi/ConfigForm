import type { DataSourceItem } from '../shared'
import type { DataSourceConfig, RequestAdapter, RequestConfig } from '../types'
import { FormPath, isArray, isFunction, isObject, isString } from '../shared'

/** 请求适配器注册表 */
const adapterRegistry = new Map<string, RequestAdapter>()

/** 数据源缓存 */
const cache = new Map<string, { data: DataSourceItem[], timestamp: number }>()

/** 正在进行的请求去重表（相同 cacheKey 复用同一个 Promise） */
const pendingRequests = new Map<string, Promise<DataSourceItem[]>>()

/** 默认缓存有效期（ms） */
const DEFAULT_CACHE_TTL = 60000

/** 默认请求适配器（fetch） */
const defaultAdapter: RequestAdapter = {
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
 * 对 params 的 key 排序后序列化，确保相同参数不同 key 顺序产生一致的 key。
 */
function buildCacheKey(config: DataSourceConfig, resolvedParams: Record<string, unknown>): string {
  const sortedParams: Record<string, unknown> = {}
  for (const key of Object.keys(resolvedParams).sort()) {
    sortedParams[key] = resolvedParams[key]
  }
  return `${config.url}:${JSON.stringify(sortedParams)}`
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
    console.warn('[ConfigForm] 数据源响应不是数组且未配置 transform，返回空列表。请检查 API 响应格式或配置 transform 函数。')
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

  const resolvedParams = resolveParams(config.params, values)
  const cacheKey = buildCacheKey(config, resolvedParams)

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

  /* 并发去重：如果已有相同请求在进行中，复用其 Promise */
  const pending = pendingRequests.get(cacheKey)
  if (pending) {
    return pending
  }

  /* 发起请求 */
  const requestPromise = (async () => {
    try {
      const adapter = getAdapter(config.requestAdapter)
      const data = await adapter.request({
        url: config.url!,
        method: config.method ?? 'GET',
        params: resolvedParams,
        headers: config.headers,
        signal,
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
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, requestPromise)
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
    if (key.startsWith(urlPrefix)) {
      cache.delete(key)
    }
  }
}
