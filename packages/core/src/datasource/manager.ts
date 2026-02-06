import type { DataSourceItem } from '@moluoxixi/shared'
import type { DataSourceConfig, RequestAdapter, RequestConfig } from '../types'
import { FormPath, isArray, isFunction, isObject, isString } from '@moluoxixi/shared'

/** 请求适配器注册表 */
const adapterRegistry = new Map<string, RequestAdapter>()

/** 数据源缓存 */
const cache = new Map<string, { data: DataSourceItem[], timestamp: number }>()

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

    const response = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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

/** 生成缓存 key */
function buildCacheKey(config: DataSourceConfig, resolvedParams: Record<string, unknown>): string {
  return `${config.url}:${JSON.stringify(resolvedParams)}`
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
      resolved[key] = FormPath.getIn(values, path)
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

  return []
}

/**
 * 加载远程数据源
 */
export async function fetchDataSource(
  config: DataSourceConfig,
  values: Record<string, unknown>,
): Promise<DataSourceItem[]> {
  if (!config.url)
    return []

  const resolvedParams = resolveParams(config.params, values)

  /* 检查缓存 */
  if (config.cache) {
    const cacheKey = buildCacheKey(config, resolvedParams)
    const cached = cache.get(cacheKey)
    if (cached) {
      const ttl = isObject(config.cache) ? (config.cache as { ttl: number }).ttl : DEFAULT_CACHE_TTL
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data
      }
      cache.delete(cacheKey)
    }
  }

  /* 发起请求 */
  const adapter = getAdapter(config.requestAdapter)
  const data = await adapter.request({
    url: config.url,
    method: config.method ?? 'GET',
    params: resolvedParams,
    headers: config.headers,
  })

  const items = transformResponse(data, config)

  /* 写入缓存 */
  if (config.cache) {
    const cacheKey = buildCacheKey(config, resolvedParams)
    cache.set(cacheKey, { data: items, timestamp: Date.now() })
  }

  return items
}

/** 清除数据源缓存 */
export function clearDataSourceCache(): void {
  cache.clear()
}
