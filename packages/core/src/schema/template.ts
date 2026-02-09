import type { ISchema } from './types'
import { mergeSchema } from './merge'

/**
 * Schema 模板定义
 *
 * 模板是可复用的 Schema 片段，支持参数化定制。
 */
export interface SchemaTemplate {
  /** 模板唯一标识 */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板分类（用于 UI 分组展示） */
  category?: string
  /** 基础 Schema 定义 */
  schema: ISchema
  /**
   * 参数声明。
   * 定义模板支持的参数，实例化时可通过参数定制 Schema。
   */
  params?: SchemaTemplateParam[]
  /** 模板版本 */
  version?: string
}

/**
 * 模板参数声明
 */
export interface SchemaTemplateParam {
  /** 参数名 */
  name: string
  /** 参数类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  /** 参数标签 */
  label: string
  /** 默认值 */
  defaultValue?: unknown
  /** 是否必填 */
  required?: boolean
  /** 参数描述 */
  description?: string
}

/**
 * 模板实例化选项
 */
export interface TemplateInstantiateOptions {
  /** 模板参数值 */
  params?: Record<string, unknown>
  /** Schema 覆盖（深度合并到模板 Schema 上） */
  overrides?: Partial<ISchema>
}

/**
 * Schema 模板注册表
 *
 * 全局单例，管理所有注册的 Schema 模板。
 * 支持注册、查询、实例化、分类检索等操作。
 *
 * @example
 * ```ts
 * // 注册模板
 * templateRegistry.register({
 *   id: 'address',
 *   name: '地址信息',
 *   category: '常用',
 *   schema: {
 *     type: 'object',
 *     properties: {
 *       province: { type: 'string', title: '省份' },
 *       city: { type: 'string', title: '城市' },
 *       detail: { type: 'string', title: '详细地址', component: 'Textarea' },
 *     },
 *   },
 *   params: [
 *     { name: 'required', type: 'boolean', label: '是否必填', defaultValue: false },
 *   ],
 * })
 *
 * // 实例化模板
 * const addressSchema = templateRegistry.instantiate('address', {
 *   params: { required: true },
 *   overrides: { title: '收货地址' },
 * })
 * ```
 */
class SchemaTemplateRegistry {
  private templates = new Map<string, SchemaTemplate>()

  /**
   * 注册模板
   *
   * @param template - 模板定义
   * @throws 如果 id 已存在
   */
  register(template: SchemaTemplate): void {
    if (this.templates.has(template.id)) {
      console.warn(
        `[ConfigForm] 模板 "${template.id}" 已存在，将被覆盖`,
      )
    }
    this.templates.set(template.id, template)
  }

  /**
   * 批量注册模板
   */
  registerAll(templates: SchemaTemplate[]): void {
    for (const template of templates) {
      this.register(template)
    }
  }

  /**
   * 注销模板
   */
  unregister(id: string): boolean {
    return this.templates.delete(id)
  }

  /**
   * 获取模板定义
   */
  get(id: string): SchemaTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * 检查模板是否存在
   */
  has(id: string): boolean {
    return this.templates.has(id)
  }

  /**
   * 获取所有模板
   */
  getAll(): SchemaTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 按分类获取模板
   */
  getByCategory(category: string): SchemaTemplate[] {
    return this.getAll().filter(t => t.category === category)
  }

  /**
   * 获取所有分类名
   */
  getCategories(): string[] {
    const categories = new Set<string>()
    for (const template of this.templates.values()) {
      if (template.category) categories.add(template.category)
    }
    return Array.from(categories)
  }

  /**
   * 实例化模板
   *
   * 将模板 Schema 与参数和覆盖项合并，生成最终的 Schema。
   *
   * @param id - 模板 ID
   * @param options - 实例化选项
   * @returns 实例化后的 Schema
   * @throws 模板不存在时
   */
  instantiate(id: string, options: TemplateInstantiateOptions = {}): ISchema {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`[ConfigForm] 模板 "${id}" 不存在`)
    }

    /* 深拷贝基础 Schema */
    let schema = JSON.parse(JSON.stringify(template.schema)) as ISchema

    /* 应用参数 */
    if (options.params && template.params) {
      schema = applyTemplateParams(schema, template.params, options.params)
    }

    /* 应用覆盖 */
    if (options.overrides) {
      schema = mergeSchema(schema, options.overrides as ISchema)
    }

    return schema
  }

  /** 清空注册表 */
  clear(): void {
    this.templates.clear()
  }
}

/**
 * 将模板参数应用到 Schema
 *
 * 遍历 Schema，将 `{{$param.xxx}}` 占位符替换为实际参数值。
 */
function applyTemplateParams(
  schema: ISchema,
  paramDefs: SchemaTemplateParam[],
  params: Record<string, unknown>,
): ISchema {
  /* 构建参数值映射（含默认值） */
  const resolvedParams: Record<string, unknown> = {}
  for (const def of paramDefs) {
    resolvedParams[def.name] = params[def.name] ?? def.defaultValue
  }

  /* 递归替换 */
  return replaceParams(schema, resolvedParams)
}

/**
 * 递归替换 Schema 中的参数占位符
 */
function replaceParams(obj: unknown, params: Record<string, unknown>): ISchema {
  if (typeof obj === 'string') {
    /* 整体替换：{{$param.xxx}} */
    const match = obj.match(/^\{\{\$param\.(\w+)\}\}$/)
    if (match) {
      return params[match[1]] as ISchema
    }

    /* 内联替换：包含 {{$param.xxx}} 的字符串 */
    return obj.replace(/\{\{\$param\.(\w+)\}\}/g, (_, key) => {
      return String(params[key] ?? '')
    }) as unknown as ISchema
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceParams(item, params)) as unknown as ISchema
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceParams(value, params)
    }
    return result as ISchema
  }

  return obj as ISchema
}

/** 全局模板注册表单例 */
export const templateRegistry = new SchemaTemplateRegistry()

/**
 * 注册模板（便捷函数）
 */
export function registerTemplate(template: SchemaTemplate): void {
  templateRegistry.register(template)
}

/**
 * 实例化模板（便捷函数）
 */
export function instantiateTemplate(id: string, options?: TemplateInstantiateOptions): ISchema {
  return templateRegistry.instantiate(id, options)
}
