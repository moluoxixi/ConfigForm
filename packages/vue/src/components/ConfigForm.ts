import type { FormConfig, FormInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/schema'
import type { ComponentType, FieldPattern } from '@moluoxixi/shared'
import type { Component, PropType } from 'vue'
import { defineComponent, h, inject } from 'vue'
import { ComponentRegistrySymbol } from '../context'
import { useCreateForm } from '../composables/useForm'
import { FormProvider } from './FormProvider'
import { SchemaField } from './SchemaField'

/**
 * 开箱即用的配置化表单组件
 *
 * 从 schema 根节点的 decoratorProps 读取表单级配置（labelWidth、actions 等）。
 * 操作按钮（提交/重置）通过 schema.decoratorProps.actions 配置，编辑态自动渲染，
 * readOnly/disabled 模式自动隐藏。
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
    wrappers: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
  },
  emits: ['submit', 'submitFailed', 'valuesChange'],
  setup(props, { slots, emit }) {
    /** 从根 schema 的 decoratorProps 提取表单级配置 */
    const rootDecoratorProps = (props.schema?.decoratorProps ?? {}) as Record<string, unknown>

    const internalForm = useCreateForm({
      labelPosition: (rootDecoratorProps.labelPosition ?? 'right') as 'top' | 'left' | 'right',
      labelWidth: rootDecoratorProps.labelWidth as string | number,
      pattern: (rootDecoratorProps.pattern ?? 'editable') as FieldPattern,
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
    })
    const form = props.form ?? internalForm

    form.onValuesChange((values) => {
      emit('valuesChange', values)
    })

    const handleSubmit = async (e: Event): Promise<void> => {
      e.preventDefault()
      e.stopPropagation()
      const result = await form.submit()
      if (result.errors.length > 0) {
        emit('submitFailed', result.errors)
      }
      else {
        emit('submit', result.values)
      }
    }

    return () => {
      const actions = rootDecoratorProps.actions as Record<string, unknown> | undefined
      const pattern = (props.schema?.pattern ?? rootDecoratorProps.pattern ?? 'editable') as string
      const isEditable = pattern === 'editable'

      /* 按钮配置 */
      const showActions = actions && isEditable
      const submitLabel = typeof actions?.submit === 'string' ? actions.submit : '提交'
      const resetLabel = typeof actions?.reset === 'string' ? actions.reset : '重置'
      const showSubmit = actions?.submit !== false
      const showReset = actions?.reset !== false

      return h(FormProvider, {
        form,
        components: props.components,
        wrappers: props.wrappers,
      }, () =>
        h('form', {
          onSubmit: handleSubmit,
          novalidate: true,
        }, [
          props.schema ? h(SchemaField, { schema: props.schema }) : null,

          /* 操作按钮 */
          showActions
            ? h(FormActionsRenderer, {
              showSubmit,
              showReset,
              submitLabel,
              resetLabel,
              onReset: () => form.reset(),
            })
            : null,

          slots.default?.({ form }),
        ]))
    }
  },
})

/** 操作按钮渲染器（优先从 registry 获取 LayoutFormActions） */
const FormActionsRenderer = defineComponent({
  name: 'FormActionsRenderer',
  props: {
    showSubmit: Boolean,
    showReset: Boolean,
    submitLabel: { type: String, default: '提交' },
    resetLabel: { type: String, default: '重置' },
  },
  emits: ['reset'],
  setup(props, { emit }) {
    const registry = inject(ComponentRegistrySymbol)

    return () => {
      const LayoutActions = registry?.components.get('LayoutFormActions') as Component | undefined

      if (LayoutActions) {
        return h(LayoutActions, {
          showSubmit: props.showSubmit,
          showReset: props.showReset,
          submitLabel: props.submitLabel,
          resetLabel: props.resetLabel,
          onReset: () => emit('reset'),
        })
      }

      const buttons: ReturnType<typeof h>[] = []
      if (props.showSubmit) {
        buttons.push(h('button', { type: 'submit', style: 'margin-right: 8px; padding: 4px 16px; cursor: pointer' }, props.submitLabel))
      }
      if (props.showReset) {
        buttons.push(h('button', { type: 'button', style: 'padding: 4px 16px; cursor: pointer', onClick: () => emit('reset') }, props.resetLabel))
      }
      return h('div', { style: 'margin-top: 16px' }, buttons)
    }
  },
})
