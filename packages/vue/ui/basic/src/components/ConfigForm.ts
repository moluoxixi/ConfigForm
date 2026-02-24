import type { ComponentType, FieldPattern, FormConfig, FormInstance, FormPlugin, ISchema } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import type { ComponentScope, RegistryState } from '@moluoxixi/vue'
import { FormLifeCycle } from '@moluoxixi/core'
import { computed, defineComponent, h, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCreateForm } from '@moluoxixi/vue'
import { ComponentRegistrySymbol } from '@moluoxixi/vue'
import { FormProvider } from '@moluoxixi/vue'
import { SchemaField } from '@moluoxixi/vue'
import { scrollToFirstError } from '../utils/scrollToFirstError'

/**
 * schema 转换插件桥接能力。
 * 同时兼容历史命名 `translateSchema` 与新命名 `transformSchema`。
 */
interface SchemaTransformPluginBridge {
  translateSchema?: (schema: ISchema) => ISchema
  transformSchema?: (schema: ISchema) => ISchema
  subscribe?: (listener: () => void) => (() => void) | void
  subscribeSchemaChange?: (listener: () => void) => (() => void) | void
}

/** 操作按钮渲染器（优先从 registry 获取 LayoutFormActions） */
const FormActionsRenderer = defineComponent({
  name: 'FormActionsRenderer',
  props: {
    showSubmit: Boolean,
    showReset: Boolean,
    submitLabel: { type: String, default: '提交' },
    resetLabel: { type: String, default: '重置' },
    align: { type: String as PropType<'left' | 'center' | 'right'>, default: 'center' },
    extraActions: {
      type: Object as PropType<Record<string, unknown>>,
      /** 默认空扩展动作集合。 */
      default: () => ({}),
    },
  },
  emits: ['reset', 'submit', 'submitFailed'],
  /**
   * 渲染表单操作区。
   * 优先使用注册表中的 `LayoutFormActions`，未注册时回退为内置按钮样式。
   */
  setup(props, { emit }) {
    const registryRef = inject(ComponentRegistrySymbol)

    return () => {
      const LayoutActions = registryRef?.value.components.get('LayoutFormActions') as Component

      if (LayoutActions) {
        return h(LayoutActions, {
          showSubmit: props.showSubmit,
          showReset: props.showReset,
          submitLabel: props.submitLabel,
          resetLabel: props.resetLabel,
          align: props.align,
          extraActions: props.extraActions,
        })
      }

      const justifyContent = props.align === 'left' ? 'flex-start' : props.align === 'right' ? 'flex-end' : 'center'
      const buttons: ReturnType<typeof h>[] = []
      if (props.showSubmit) {
        buttons.push(h('button', { type: 'submit', style: 'margin-right: 8px; padding: 4px 16px; cursor: pointer' }, props.submitLabel))
      }
      if (props.showReset) {
        buttons.push(h('button', {
          type: 'button',
          style: 'padding: 4px 16px; cursor: pointer',
          onClick: () => emit('reset'),
        }, props.resetLabel))
      }
      for (const [actionName, config] of Object.entries(props.extraActions)) {
        if (!isActionEnabled(config)) {
          continue
        }
        const actionComponent = registryRef?.value.actions.get(actionName)
        if (!actionComponent) {
          continue
        }
        buttons.push(h(actionComponent as Component, { key: actionName, ...resolveActionProps(config) }))
      }
      return h('div', { style: `margin-top: 16px; display: flex; justify-content: ${justifyContent}; gap: 8px; flex-wrap: wrap;` }, buttons)
    }
  },
})

/**
 * 开箱即用的配置化表单组件
 *
 * 从 schema 根节点的 decoratorProps 读取表单级配置（labelWidth、actions 等）。
 * 操作按钮（提交/重置）通过 schema.decoratorProps.actions 配置，编辑态自动渲染，
 * preview/disabled 模式自动隐藏。
 *
 * @example
 * ```vue
 * <ConfigForm
 *   :schema="{
 *     type: 'object',
 *     decoratorProps: { labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
 *     properties: {
 *       name: { type: 'string', title: '姓名', required: true },
 *     }
 *   }"
 *   @submit="handleSubmit"
 * />
 * ```
 */
export const ConfigForm = defineComponent({
  name: 'ConfigForm',
  props: {
    form: {
      type: Object as PropType<FormInstance>,
      default: undefined,
    },
    schema: {
      type: Object as PropType<ISchema>,
      default: undefined,
    },
    formConfig: {
      type: Object as PropType<FormConfig>,
      default: undefined,
    },
    initialValues: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    components: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    decorators: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    actions: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    defaultDecorators: {
      type: Object as PropType<Record<string, string>>,
      default: undefined,
    },
    readPrettyComponents: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    scope: {
      type: Object as PropType<ComponentScope>,
      default: undefined,
    },
    registry: {
      type: Object as PropType<RegistryState>,
      default: undefined,
    },
    effects: {
      type: Function as PropType<(form: FormInstance) => void>,
      default: undefined,
    },
    plugins: {
      type: Array as PropType<FormPlugin[]>,
      default: undefined,
    },
    pattern: {
      type: String as PropType<FieldPattern>,
      default: undefined,
    },
  },
  emits: ['submit', 'submitFailed', 'valuesChange', 'reset'],
  /**
   * 组装 ConfigForm 渲染上下文并输出渲染函数。
   * 负责桥接 form 生命周期、schema 转换插件、响应式布局和操作按钮逻辑。
   *
   * @param props ConfigForm 组件属性。
   * @param context setup 上下文，包含插槽与事件派发能力。
   * @returns 返回渲染函数。
   */
  setup(props, context) {
    const { slots, emit } = context
    /** 从根 schema 的 decoratorProps 提取表单级配置（用于创建表单） */
    const rawDecoratorProps = computed(() =>
      (props.schema?.decoratorProps ?? {}) as Record<string, unknown>,
    )

    const initialPattern = computed<FieldPattern>(() =>
      (props.pattern ?? props.schema?.pattern ?? rawDecoratorProps.value.pattern ?? 'editable') as FieldPattern,
    )

    const resolvedEffects = props.effects ?? props.formConfig?.effects
    const resolvedPlugins = props.plugins ?? props.formConfig?.plugins

    const internalForm = useCreateForm({
      labelPosition: (rawDecoratorProps.value.labelPosition ?? 'right') as 'top' | 'left' | 'right',
      labelWidth: rawDecoratorProps.value.labelWidth as string | number,
      pattern: initialPattern.value,
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
      effects: resolvedEffects,
      plugins: resolvedPlugins,
    })
    const form = props.form ?? internalForm

    const schemaTransformVersion = ref(0)
    const schemaTransformers = computed(() => collectSchemaTransformers(form))
    const schemaTransformDisposers: Array<() => void> = []

    /**
     * 绑定 schema 转换插件的订阅回调。
     * 每次重新绑定前会先执行旧订阅释放，避免重复订阅导致版本号抖动。
     */
    const bindSchemaTransformers = (): void => {
      while (schemaTransformDisposers.length > 0) {
        schemaTransformDisposers.pop()?.()
      }

      for (const transformer of schemaTransformers.value) {
        const subscribe = transformer.subscribeSchemaChange ?? transformer.subscribe
        if (typeof subscribe !== 'function') {
          continue
        }
        const dispose = subscribe(() => {
          schemaTransformVersion.value += 1
        })
        if (typeof dispose === 'function') {
          schemaTransformDisposers.push(dispose)
        }
      }
    }

    const effectiveSchema = computed(() => {
      const schema = props.schema
      if (!schema)
        return schema
      if (schemaTransformers.value.length === 0)
        return schema
      void schemaTransformVersion.value
      return applySchemaTransforms(schema, schemaTransformers.value)
    })

    /** 响应式读取根 schema 的 decoratorProps（schema 变化时自动更新） */
    const rootDecoratorProps = computed(() =>
      (effectiveSchema.value?.decoratorProps ?? {}) as Record<string, unknown>,
    )

    const effectivePattern = computed<FieldPattern>(() =>
      (props.pattern ?? effectiveSchema.value?.pattern ?? rootDecoratorProps.value.pattern ?? 'editable') as FieldPattern,
    )

    /** schema 变化时同步更新表单级配置 */
    watch([rootDecoratorProps, effectivePattern], ([newProps, pattern]) => {
      form.batch(() => {
        if (newProps.labelPosition !== undefined) {
          form.labelPosition = newProps.labelPosition as 'top' | 'left' | 'right'
        }
        if (newProps.labelWidth !== undefined) {
          form.labelWidth = newProps.labelWidth as string | number
        }
        form.pattern = pattern
      })
    }, { immediate: true })

    watch(schemaTransformers, () => {
      bindSchemaTransformers()
    })

    const disposeValuesChange = form.onValuesChange((values) => {
      emit('valuesChange', values)
    })

    const disposeSubmitSuccess = form.on(FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, (event) => {
      const payload = event.payload as { values?: Record<string, unknown> } | undefined
      if (payload && payload.values) {
        emit('submit', payload.values)
      }
    })

    const disposeSubmitFailed = form.on(FormLifeCycle.ON_FORM_SUBMIT_FAILED, (event) => {
      const payload = event.payload as { errors?: Array<{ path: string, message: string }> } | undefined
      const errors = payload?.errors ?? []
      emit('submitFailed', errors)
      scrollToFirstError(errors)
    })

    const disposeReset = form.on(FormLifeCycle.ON_FORM_RESET, () => {
      emit('reset')
    })

    /**
     * Grid 响应式断点支持
     *
     * 使用 ResizeObserver 监听容器宽度变化，
     * 根据断点配置动态调整网格列数。
     */
    const gridContainerRef = ref<HTMLElement | null>(null)
    const responsiveColumns = ref<number | null>(null)
    let resizeObserver: ResizeObserver | null = null

    /**
     * 根据容器宽度命中断点并计算列数。
     * @param width 当前容器宽度。
     * @param breakpoints 断点配置（键为最小宽度，值为列数）。
     * @returns 返回当前宽度下应使用的列数。
     */
    const resolveBreakpointColumns = (width: number, breakpoints: Record<number, number>): number => {
      const sortedBreakpoints = Object.entries(breakpoints)
        .map(([w, c]) => [Number(w), c] as [number, number])
        .sort((a, b) => a[0] - b[0])

      let cols = sortedBreakpoints[0]?.[1] ?? 1
      for (const [minWidth, colCount] of sortedBreakpoints) {
        if (width >= minWidth)
          cols = colCount
      }
      return cols
    }

    onMounted(() => {
      bindSchemaTransformers()
      const layout = props.schema?.layout as { breakpoints?: Record<number, number> } | undefined
      if (layout?.breakpoints && gridContainerRef.value) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = entry.contentRect.width
            responsiveColumns.value = resolveBreakpointColumns(width, layout.breakpoints!)
          }
        })
        resizeObserver.observe(gridContainerRef.value)
      }
    })

    onUnmounted(() => {
      disposeValuesChange()
      disposeSubmitSuccess()
      disposeSubmitFailed()
      disposeReset()
      while (schemaTransformDisposers.length > 0) {
        schemaTransformDisposers.pop()?.()
      }
      resizeObserver?.disconnect()
      resizeObserver = null
    })

    /**
     * 处理表单 submit 事件，统一走 form.submit。
     * @param e 原生 submit 事件对象。
     */
    const handleSubmit = async (e: Event): Promise<void> => {
      e.preventDefault()
      e.stopPropagation()
      await form.submit()
    }

    return () => {
      const currentDecoratorProps = rootDecoratorProps.value
      const actions = isRecord(currentDecoratorProps.actions) ? currentDecoratorProps.actions : undefined
      const extraActions = extractExtraActions(actions)
      const isEditable = form.pattern === 'editable'

      /* 布局配置 */
      const direction = (currentDecoratorProps.direction ?? 'vertical') as string
      const layout = effectiveSchema.value?.layout as {
        type?: string
        columns?: number
        gutter?: number
        breakpoints?: Record<number, number>
        gap?: number
      } | undefined

      /** 根据 direction / layout 计算字段容器样式 */
      let fieldContainerStyle = ''
      if (layout?.type === 'grid') {
        const gap = layout.gutter ?? 16
        /* 优先使用响应式断点列数，其次用静态 columns */
        const cols = (layout.breakpoints && responsiveColumns.value) ? responsiveColumns.value : (layout.columns ?? 1)
        fieldContainerStyle = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px; align-items: start`
      }
      else if (layout?.type === 'inline' || direction === 'inline') {
        const gap = layout?.gap ?? 16
        fieldContainerStyle = `display: flex; flex-wrap: wrap; gap: ${gap}px; align-items: flex-start`
      }

      /* 按钮配置 */
      const showActions = isEditable && (
        (actions ? actions.submit !== false || actions.reset !== false : false)
        || hasEnabledExtraActions(extraActions)
      )
      const submitLabel = typeof actions?.submit === 'string' ? actions.submit : '提交'
      const resetLabel = typeof actions?.reset === 'string' ? actions.reset : '重置'
      const showSubmit = actions?.submit !== false
      const showReset = actions?.reset !== false
      const align = (actions?.align === 'left' || actions?.align === 'right' || actions?.align === 'center')
        ? actions.align
        : 'center'

      return h(FormProvider, {
        form,
        components: props.components,
        decorators: props.decorators,
        actions: props.actions,
        defaultDecorators: props.defaultDecorators,
        readPrettyComponents: props.readPrettyComponents,
        scope: props.scope,
        registry: props.registry,
      }, () =>
        h('form', {
          onSubmit: handleSubmit,
          novalidate: true,
        }, [
          /* 字段容器（始终使用 div 包裹，避免布局切换时因 DOM 结构变化导致字段树重建） */
          effectiveSchema.value
            ? h('div', {
                ref: layout?.breakpoints ? gridContainerRef : undefined,
                style: fieldContainerStyle || undefined,
              }, [
                h(SchemaField, { schema: effectiveSchema.value }),
              ])
            : null,

          /* 操作按钮 */
          showActions
            ? h(FormActionsRenderer, {
                showSubmit,
                showReset,
                submitLabel,
                resetLabel,
                align,
                extraActions,
                onReset: () => {
                  form.reset()
                },
              })
            : null,

          slots.default?.({ form }),
        ]))
    }
  },
})

/** 判断值是否为普通对象（非 null 且非数组）。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 插件容器桥接类型。
 * 仅暴露当前模块需要的 `getPlugins` 能力，避免与具体实现强耦合。
 */
interface PluginContainerBridge {
  getPlugins?: () => ReadonlyMap<string, unknown> | undefined
}

/**
 * 从已安装插件中提取 schema 转换器。
 * @param form 插件容器桥接对象。
 * @returns 返回可执行 schema 转换的插件桥接列表。
 */
function collectSchemaTransformers(form: PluginContainerBridge): SchemaTransformPluginBridge[] {
  const plugins = form.getPlugins?.()
  if (!plugins) {
    return []
  }
  const transformers: SchemaTransformPluginBridge[] = []
  for (const pluginApi of plugins.values()) {
    if (!isRecord(pluginApi)) {
      continue
    }
    const bridge = pluginApi as SchemaTransformPluginBridge
    if (typeof bridge.translateSchema === 'function' || typeof bridge.transformSchema === 'function') {
      transformers.push(bridge)
    }
  }
  return transformers
}

/**
 * 依次应用 schema 转换器。
 * @param schema 原始 schema。
 * @param transformers 转换器列表。
 * @returns 返回转换后的 schema。
 */
function applySchemaTransforms(schema: ISchema, transformers: SchemaTransformPluginBridge[]): ISchema {
  let transformed = schema
  for (const transformer of transformers) {
    const transform = transformer.transformSchema ?? transformer.translateSchema
    if (typeof transform === 'function') {
      transformed = transform(transformed)
    }
  }
  return transformed
}

const RESERVED_FORM_ACTION_KEYS = new Set(['submit', 'reset', 'align'])

/**
 * 提取扩展动作配置。
 * 会排除保留键 `submit`、`reset`、`align`。
 *
 * @param actions 原始动作配置。
 * @returns 返回扩展动作配置对象。
 */
function extractExtraActions(actions: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!actions) {
    return {}
  }
  const extras: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(actions)) {
    if (!RESERVED_FORM_ACTION_KEYS.has(key)) {
      extras[key] = value
    }
  }
  return extras
}

/** 判断扩展动作中是否至少存在一个启用项。 */
function hasEnabledExtraActions(actions: Record<string, unknown>): boolean {
  return Object.values(actions).some(isActionEnabled)
}

/** 动作配置只要不显式等于 `false`，就视为启用。 */
function isActionEnabled(config: unknown): boolean {
  return config !== false
}

/**
 * 归一化动作配置为对象形式。
 * @param config 动作配置，可为字符串或对象。
 * @returns 返回归一化后的动作属性对象。
 */
function resolveActionProps(config: unknown): Record<string, unknown> {
  if (typeof config === 'string') {
    return { buttonText: config }
  }
  if (isRecord(config)) {
    return config
  }
  return {}
}
