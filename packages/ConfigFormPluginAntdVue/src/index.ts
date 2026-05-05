import type { FieldConfig, FormRuntimePlugin, NormalizedFieldConfig } from '@moluoxixi/config-form/plugins'

/** ConfigForm core 未适配组件库时使用的值 prop。 */
const CORE_VALUE_PROP = 'modelValue'

/** ConfigForm core 未适配组件库时使用的值更新事件。 */
const CORE_TRIGGER = 'update:modelValue'

/** Ant Design Vue 字段组件的双向绑定协议。 */
export interface AntdVueFieldBinding {
  /** 组件接收字段值的 prop 名称。 */
  valueProp: string
  /** 组件向外发出字段值变化的事件名。 */
  trigger: string
  /**
   * 组件的默认 props，在 transformField 阶段以深合并方式注入。
   *
   * 深合并规则：两端均为普通对象时递归合并，其他情况（原始值、数组等）字段配置中
   * 用户声明的 props 优先覆盖。
   */
  defaultProps?: Record<string, unknown>
}

/** Ant Design Vue 插件配置。 */
export interface AntdVuePluginOptions {
  /** runtime 插件名称，默认 "antd-vue"。 */
  name?: string
  /** 额外组件绑定或内置绑定覆盖项，key 必须是 Ant Design Vue 组件 name。 */
  bindings?: Record<string, AntdVueFieldBinding>
  /** 字段组件名形如 Ant Design Vue 组件但没有映射时是否直接抛错，默认 true。 */
  strict?: boolean
}

interface ComponentNameSource {
  __name?: unknown
  __vccOpts?: {
    name?: unknown
  }
  displayName?: unknown
  name?: unknown
}

// ===== 深合并工具 =====

type PlainObject = Record<string, unknown>

function isPlainObject(val: unknown): val is PlainObject {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * 深合并多个普通对象，后面的对象优先级更高。
 *
 * - 两端均为普通对象时递归合并
 * - 其他情况（原始值、数组、null 等）直接用后者值覆盖
 */
function deepMergeProps(...sources: Array<PlainObject | undefined>): PlainObject {
  const result: PlainObject = {}
  for (const source of sources) {
    if (!source)
      continue
    for (const key of Object.keys(source)) {
      const srcVal = source[key]
      const resVal = result[key]
      result[key] = isPlainObject(srcVal) && isPlainObject(resVal)
        ? deepMergeProps(resVal, srcVal)
        : srcVal
    }
  }
  return result
}

/** 当前插件内置支持的 Ant Design Vue 字段组件绑定表。 */
export const ANTD_VUE_FIELD_BINDINGS: Readonly<Record<string, AntdVueFieldBinding>> = Object.freeze({
  AAutoComplete: { valueProp: 'value', trigger: 'update:value' },
  ACascader: { valueProp: 'value', trigger: 'update:value' },
  ACheckbox: { valueProp: 'checked', trigger: 'update:checked' },
  ACheckboxGroup: { valueProp: 'value', trigger: 'update:value' },
  ADatePicker: { valueProp: 'value', trigger: 'update:value' },
  AInput: { valueProp: 'value', trigger: 'update:value' },
  AInputNumber: { valueProp: 'value', trigger: 'update:value' },
  AInputPassword: { valueProp: 'value', trigger: 'update:value' },
  AInputSearch: { valueProp: 'value', trigger: 'update:value' },
  ARangePicker: { valueProp: 'value', trigger: 'update:value' },
  ARate: { valueProp: 'value', trigger: 'update:value' },
  ARadioGroup: { valueProp: 'value', trigger: 'update:value' },
  ASelect: { valueProp: 'value', trigger: 'update:value' },
  ASlider: { valueProp: 'value', trigger: 'update:value' },
  ASwitch: {
    valueProp: 'checked',
    trigger: 'update:checked',
    defaultProps: { style: { width: '44px' } },
  },
  ATextarea: { valueProp: 'value', trigger: 'update:value' },
  ATimePicker: { valueProp: 'value', trigger: 'update:value' },
  ATimeRangePicker: { valueProp: 'value', trigger: 'update:value' },
  ATreeSelect: { valueProp: 'value', trigger: 'update:value' },
})

/**
 * 读取 Vue 组件对象暴露的稳定名称。
 *
 * 插件只依赖组件元信息，不直接引入 ant-design-vue，避免把 UI 库绑定进 core。
 */
function resolveComponentName(component: FieldConfig['component']): string | undefined {
  if (typeof component === 'string')
    return component

  if (!component || (typeof component !== 'object' && typeof component !== 'function'))
    return undefined

  const source = component as ComponentNameSource
  const candidates = [
    source.name,
    source.displayName,
    source.__name,
    source.__vccOpts?.name,
  ]

  return candidates.find((item): item is string => typeof item === 'string' && item.length > 0)
}

/**
 * 判断字段是否仍处于 ConfigForm core 的默认绑定协议。
 *
 * runtime hook 运行前字段已经标准化，因此插件只能把 core 默认协议视为待适配状态。
 */
function usesCoreBinding(field: NormalizedFieldConfig): boolean {
  return field.valueProp === CORE_VALUE_PROP && field.trigger === CORE_TRIGGER
}

/**
 * 判断组件名是否像 Ant Design Vue 组件名。
 *
 * 该判断仅用于 strict 诊断，不参与默认适配，避免误伤自定义组件。
 */
function isAntdVueLikeComponentName(name: string): boolean {
  return /^A[A-Z]/.test(name)
}

/**
 * 创建 Ant Design Vue 字段绑定适配插件。
 *
 * 插件只补齐仍处于 core 默认协议的字段；字段已声明自定义协议时保持原样。
 *
 * 若绑定表中存在 `defaultProps`，则以深合并方式注入到字段 props 中，
 * 用户在字段配置中声明的同名 props 具有更高优先级。
 */
export function createAntdVuePlugin(options: AntdVuePluginOptions = {}): FormRuntimePlugin {
  const bindings: Record<string, AntdVueFieldBinding> = {
    ...ANTD_VUE_FIELD_BINDINGS,
    ...(options.bindings ?? {}),
  }
  const strict = options.strict ?? true

  const plugin: FormRuntimePlugin = {
    name: options.name ?? 'antd-vue',
    transformField: (field) => {
      const componentName = resolveComponentName(field.component)
      if (!componentName)
        return undefined

      const binding = bindings[componentName]
      if (!binding) {
        if (strict && isAntdVueLikeComponentName(componentName))
          throw new Error(`Unknown Ant Design Vue component binding: ${componentName}`)
        return undefined
      }

      if (!usesCoreBinding(field))
        return undefined

      // 深合并 defaultProps（绑定表默认）与字段声明的 props（用户优先）
      const mergedProps = binding.defaultProps
        ? deepMergeProps(binding.defaultProps, field.props)
        : field.props

      return {
        ...field,
        trigger: binding.trigger,
        valueProp: binding.valueProp,
        props: mergedProps,
      }
    },
  }

  return plugin
}
