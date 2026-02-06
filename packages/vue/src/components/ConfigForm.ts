import type { FormConfig } from '@moluoxixi/core'
import type { FormSchema } from '@moluoxixi/schema'
import type { ComponentType } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { useCreateForm } from '../composables/useForm'
import { FormProvider } from './FormProvider'
import { SchemaField } from './SchemaField'

/**
 * 开箱即用的配置化表单组件
 *
 * @example
 * ```vue
 * <ConfigForm
 *   :schema="{
 *     fields: {
 *       name: { type: 'string', label: '姓名', required: true },
 *       age: { type: 'number', label: '年龄' },
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
      type: Object as PropType<FormSchema>,
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
    const internalForm = useCreateForm({
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
    })
    const form = props.form ?? internalForm

    /* 监听值变化 */
    form.onValuesChange((values) => {
      emit('valuesChange', values)
    })

    const handleSubmit = async (e: Event) => {
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
          slots.default?.({ form }),
        ]))
    }
  },
})
