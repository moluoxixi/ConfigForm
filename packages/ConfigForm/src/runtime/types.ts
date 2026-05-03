import type {
  FieldConfig,
  FormErrors,
  FormNodeConfig,
  FormValues,
  NormalizedFieldConfig,
  ResolvedField,
  ResolvedFormNode,
  RuntimeToken,
  SlotContent,
} from '@/types'

/** 运行时可按字符串 key 解析的组件注册表。 */
export type ComponentRegistry = Record<string, FieldConfig['component']>

/** 单次运行时解析需要的上下文。 */
export interface FormRuntimeContext<TValues extends FormValues = FormValues> {
  /** 当前表单值快照，表达式、条件和 token resolver 都从这里读取业务数据。 */
  values: TValues
  /** 当前校验错误快照，主要供表达式、token resolver 或自定义渲染逻辑读取。 */
  errors: FormErrors
  /** 当前正在解析或渲染的字段；组件容器节点没有字段时为空。 */
  field?: NormalizedFieldConfig
  /** 当前节点来自父组件的哪个 slot；根节点或非 slot 场景为空。 */
  slotName?: string
  /** 当前 scoped slot 调用传入的作用域对象；非 scoped slot 场景为空。 */
  slotScope?: Record<string, unknown>
}

/** token resolver 可调用的 runtime 辅助方法。 */
export interface FormRuntimeResolveHelpers {
  /** 使用同一套 runtime 规则继续解析嵌套值。 */
  resolveValue: <TValue = unknown>(value: TValue, context: FormRuntimeContext, path?: string) => unknown
}

/** 自定义 RuntimeToken 的解析函数。 */
export type FormRuntimeTokenResolver<TToken extends RuntimeToken = RuntimeToken> = (
  /** createRuntimeToken 创建的 token 对象。 */
  token: TToken,
  /** 当前解析上下文。 */
  context: FormRuntimeContext,
  /** token 所在配置路径。 */
  path: string,
  /** 递归解析辅助方法。 */
  helpers: FormRuntimeResolveHelpers,
) => unknown

/** hook 边界顺序；未声明时按插件注册顺序位于 pre 和 post 之间。 */
export type FormRuntimeHookOrder = 'pre' | 'post'

/** Rollup 风格 object hook，可只传函数，也可声明 pre/post 边界时机。 */
export type FormRuntimeObjectHook<THandler extends (...args: never[]) => unknown>
  = | THandler
    | {
      /** pre 先于普通 hook，post 晚于普通 hook；同组内仍按插件注册顺序执行。 */
      order?: FormRuntimeHookOrder
      /** 实际 hook 函数。 */
      handler: THandler
    }

/** 字段转换 hook 的上下文；只包含静态字段和 slot 位置信息，不暴露 values/errors。 */
export interface FormRuntimeTransformContext {
  /** 当前正在转换的字段快照。 */
  field: NormalizedFieldConfig
  /** 当前字段来自父组件的哪个 slot；根节点或非 slot 场景为空。 */
  slotName?: string
  /** 当前 scoped slot 调用传入的作用域对象；非 scoped slot 场景为空。 */
  slotScope?: Record<string, unknown>
}

/** transformField 的可选入参；用于把 slot 位置信息传入转换层。 */
export interface FormRuntimeTransformContextInput {
  /** 当前字段来自父组件的哪个 slot。 */
  slotName?: string
  /** 当前 scoped slot 作用域。 */
  slotScope?: Record<string, unknown>
}

/** 字段转换 hook：在 core normalize 后、resolve 前顺序执行。 */
export type FormFieldTransform = (
  /** 当前已标准化字段；插件不得原地修改。 */
  field: NormalizedFieldConfig,
  /** 静态转换上下文，不包含表单值和错误。 */
  context: FormRuntimeTransformContext,
) => FieldConfig | NormalizedFieldConfig | void

/** runtime 插件：用于注册组件、token resolver，或通过生命周期转换字段声明。 */
export interface FormRuntimePlugin {
  /** 插件唯一名称；重复名称会直接抛错，避免插件注册互相覆盖。 */
  name: string
  /** 本插件注册的组件 key。 */
  components?: ComponentRegistry
  /** 本插件注册的 token resolver。 */
  tokens?: Record<string, FormRuntimeTokenResolver>
  /** 字段标准化之后、正式解析之前调用；同 hook 先 pre、再普通、最后 post。 */
  transformField?: FormRuntimeObjectHook<FormFieldTransform>
}

/** 表达式适配器，用于接入外部表达式引擎。 */
export interface FormExpressionAdapter {
  /** 返回 undefined 表示交给内置表达式解析器继续处理。 */
  evaluate?: (input: unknown, context: FormRuntimeContext) => unknown
}

/** 创建 FormRuntime 时可配置的选项。 */
export interface FormRuntimeOptions {
  /** 全局组件注册表。 */
  components?: ComponentRegistry
  /** 运行时插件列表；按用户注册顺序执行，同一 hook 仅允许 pre/post 边界排序。 */
  plugins?: FormRuntimePlugin[]
  /** 自定义表达式解析器。 */
  expression?: FormExpressionAdapter
}

/** createContext 的输入；所有字段都是可选的，缺省值由 runtime 填充。 */
export interface CreateRuntimeContextInput<TValues extends FormValues = FormValues> {
  /** 当前表单值。缺省为空对象。 */
  values?: TValues
  /** 当前校验错误。缺省为空对象。 */
  errors?: FormErrors
  /** 当前字段上下文。 */
  field?: NormalizedFieldConfig
  /** 当前 slot 名称。 */
  slotName?: string
  /** 当前 scoped slot 作用域。 */
  slotScope?: Record<string, unknown>
}

/** 表单运行时实例，负责把声明式表单配置解析成渲染层可直接消费的结构。 */
export interface FormRuntime {
  /** runtime 实例品牌标记，用于 isFormRuntime 判断。 */
  readonly __configFormRuntime: true
  /** 创建一次解析上下文，保证 values/errors 至少是对象。 */
  createContext: <TValues extends FormValues = FormValues>(
    input?: CreateRuntimeContextInput<TValues>,
  ) => FormRuntimeContext<TValues>
  /** 解析 RuntimeToken、表达式、数组和普通对象中的嵌套运行时值。 */
  resolveValue: <TValue = unknown>(value: TValue, context: FormRuntimeContext, path?: string) => unknown
  /** 执行 core normalize 和插件 transformField 生命周期，得到后续渲染、校验、提交共享的字段。 */
  transformField: (
    field: FieldConfig | NormalizedFieldConfig,
    context?: FormRuntimeTransformContextInput,
  ) => NormalizedFieldConfig
  /** 解析 slot 内容，包括 slot 函数、slot 节点配置、数组和 token。 */
  resolveSlot: (slot: SlotContent, context: FormRuntimeContext, path?: string) => SlotContent
  /** 解析字段节点或组件容器节点。 */
  resolveNode: (node: FormNodeConfig, context: FormRuntimeContext, path?: string) => ResolvedFormNode
  /** 解析字段配置，得到已补全默认项且组件/props/slots 已解析的字段。 */
  resolveField: (field: FieldConfig, context: FormRuntimeContext) => ResolvedField
  /** 解析字段 visible 条件，缺省为 true。 */
  resolveVisible: (field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext) => boolean
  /** 解析字段 disabled 条件，缺省为 false。 */
  resolveDisabled: (field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext) => boolean
}

/** 组件 props 接受的 runtime 入参：可传已创建的实例，也可传 options 让组件内部创建。 */
export type FormRuntimeInput = FormRuntime | FormRuntimeOptions
