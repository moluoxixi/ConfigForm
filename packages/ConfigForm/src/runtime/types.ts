import type {
  DefinedFormNodeConfig,
  FieldConfig,
  FormNodeConfig,
  NormalizedFieldConfig,
  NormalizedNodeConfig,
  ResolvedFormNode,
} from '@/types'

/** 运行时可按字符串 key 解析的组件注册表。 */
export type ComponentRegistry = Record<string, FieldConfig['component']>

/** 字段默认值 hook 返回的配置片段；只表达默认值，最终仍由用户字段声明覆盖。 */
export type FormFieldDefaultConfig = Partial<Omit<FieldConfig, 'component' | 'field' | 'slots'>>

/** 字段默认值 hook：接收原始节点声明，返回要参与默认值合并的字段片段或 undefined。 */
export type FormFieldDefault = (
  field: FormNodeConfig,
) => FormFieldDefaultConfig | void

/** 字段转换 hook：接收已补齐默认值的节点，返回转换后的节点或 undefined。 */
export type FormFieldTransform = (
  field: NormalizedFieldConfig | NormalizedNodeConfig,
) => DefinedFormNodeConfig | NormalizedNodeConfig | void

/** runtime 插件：用于注册组件或转换字段声明。 */
export interface FormRuntimePlugin {
  /** 插件唯一名称；重复名称会直接抛错，避免插件注册互相覆盖。 */
  name: string
  /** 本插件注册的组件 key。 */
  components?: ComponentRegistry
  /** 默认值生命周期；返回值在内置默认值之后、用户字段声明之前参与深合并。 */
  getDefaultField?: FormFieldDefault
  /** 字段默认值合并后调用；只接收 field，不接收表单状态上下文。 */
  transformField?: FormFieldTransform
}

/** 创建 FormRuntime 时可配置的选项。 */
export interface FormRuntimeOptions {
  /** 全局组件注册表；用户注册优先于内置组件。 */
  components?: ComponentRegistry
  /** 运行时插件列表；按用户注册顺序执行。 */
  plugins?: FormRuntimePlugin[]
}

/** 表单运行时实例，负责把声明式表单配置转换为渲染层可直接消费的结构。 */
export interface FormRuntime {
  /** 返回单个节点的合并默认配置片段；优先级为用户插件默认值高于内置默认值。 */
  getFieldDefaults: (field: FormNodeConfig) => FormFieldDefaultConfig
  /** 应用默认片段、执行转换插件、解析组件并递归处理 slot。 */
  transformField: (field: FormNodeConfig) => ResolvedFormNode
}
