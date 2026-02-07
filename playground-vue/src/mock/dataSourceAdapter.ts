/**
 * Mock 请求适配器
 *
 * 模拟远程 API 调用，走完整的 fetchDataSource → resolveParams → transformResponse 管线。
 * 所有请求通过 registerRequestAdapter('mock', ...) 注册到核心库。
 */
import type { RequestConfig } from '@moluoxixi/core'
import { registerRequestAdapter } from '@moluoxixi/core'

/** 模拟网络延迟（ms） */
const DELAY = 600

/* ================== Mock 数据库 ================== */

const MODELS: Record<string, Array<{ name: string, id: string }>> = {
  apple: [
    { name: 'iPhone 15', id: 'iphone15' },
    { name: 'iPhone 15 Pro', id: 'iphone15pro' },
    { name: 'MacBook Pro', id: 'macbook-pro' },
  ],
  huawei: [
    { name: 'Mate 60', id: 'mate60' },
    { name: 'P60', id: 'p60' },
    { name: 'MatePad Pro', id: 'matepad-pro' },
  ],
  xiaomi: [
    { name: '小米 14', id: 'mi14' },
    { name: 'Redmi K70', id: 'redmik70' },
  ],
}

const CONFIGS: Record<string, Array<{ name: string, id: string }>> = {
  'iphone15': [
    { name: '128GB / 黑色', id: '128-black' },
    { name: '256GB / 白色', id: '256-white' },
    { name: '512GB / 蓝色', id: '512-blue' },
  ],
  'iphone15pro': [
    { name: '256GB / 钛金属', id: '256-titanium' },
    { name: '512GB / 钛金属', id: '512-titanium' },
    { name: '1TB / 钛金属', id: '1tb-titanium' },
  ],
  'macbook-pro': [
    { name: 'M3 / 16GB / 512GB', id: 'm3-16-512' },
    { name: 'M3 Pro / 36GB / 1TB', id: 'm3pro-36-1tb' },
  ],
  'mate60': [
    { name: '256GB 雅丹黑', id: '256-black' },
    { name: '512GB 南糯紫', id: '512-purple' },
  ],
  'p60': [
    { name: '128GB 翡冷翠', id: '128-green' },
    { name: '256GB 洛可可白', id: '256-white' },
  ],
  'mi14': [
    { name: '256GB 黑色', id: '256-black' },
    { name: '512GB 白色', id: '512-white' },
    { name: '1TB 钛金属', id: '1tb-titanium' },
  ],
}

const CLASSES: Record<string, Array<{ name: string, id: string }>> = {
  grade1: [
    { name: '一(1)班 - 王老师', id: 'c1' },
    { name: '一(2)班 - 李老师', id: 'c2' },
    { name: '一(3)班 - 张老师', id: 'c3' },
  ],
  grade2: [
    { name: '二(1)班 - 赵老师', id: 'c1' },
    { name: '二(2)班 - 刘老师', id: 'c2' },
  ],
  grade3: [
    { name: '三(1)班 - 陈老师', id: 'c1' },
    { name: '三(2)班 - 周老师', id: 'c2' },
    { name: '三(3)班 - 吴老师', id: 'c3' },
    { name: '三(4)班 - 郑老师', id: 'c4' },
  ],
}

/** 1000 条用户 mock */
const USERS = Array.from({ length: 1000 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `用户${String(i + 1).padStart(4, '0')}`,
  dept: ['技术部', '产品部', '设计部', '运营部'][i % 4],
  email: `user${i + 1}@example.com`,
}))

/* ================== 路由处理 ================== */

/** API 日志（方便调试） */
const logs: string[] = []
export function getApiLogs(): string[] {
  return logs
}
export function clearApiLogs(): void {
  logs.length = 0
}

/** 路由表：URL → 处理函数 */
const routes: Record<string, (params: Record<string, unknown>) => unknown> = {
  '/api/models': (params) => {
    const brand = params.brand as string
    return MODELS[brand] ?? []
  },

  '/api/configs': (params) => {
    const model = params.model as string
    return CONFIGS[model] ?? []
  },

  '/api/classes': (params) => {
    const grade = params.grade as string
    return CLASSES[grade] ?? []
  },

  '/api/users': (params) => {
    const keyword = (params.keyword as string) ?? ''
    const page = Number(params.page ?? 1)
    const pageSize = Number(params.pageSize ?? 20)

    const filtered = keyword
      ? USERS.filter(u => u.name.includes(keyword) || u.dept.includes(keyword))
      : USERS

    const start = (page - 1) * pageSize
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    }
  },
}

/* ================== 注册适配器 ================== */

/** 注册 mock 请求适配器到核心库 */
export function setupMockAdapter(): void {
  registerRequestAdapter('mock', {
    async request<T>(config: RequestConfig): Promise<T> {
      const { url, params } = config
      const handler = routes[url]

      const logEntry = `[Mock API] ${config.method} ${url} params=${JSON.stringify(params ?? {})}`

      if (!handler) {
        const err = `${logEntry} → 404 Not Found`
        logs.push(err)
        console.warn(err)
        throw new Error(`Mock API: 未知路由 ${url}`)
      }

      /* 模拟网络延迟 */
      await new Promise(r => setTimeout(r, DELAY))

      const data = handler(params ?? {})
      const logResult = `${logEntry} → 200 OK (${JSON.stringify(data).length} bytes)`
      logs.push(logResult)
      console.log(logResult)

      return data as T
    },
  })
}
