import type { CompileOptions, FormSchema } from '@moluoxixi/schema'
import type { PropType } from 'vue'
import { compileSchema, toArrayFieldProps, toFieldProps } from '@moluoxixi/schema'
import { computed, defineComponent, h, inject } from 'vue'
import { FormSymbol } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'

/**
 * Schema 驱动的字段渲染器
 */
export const SchemaField = defineComponent({
  name: 'SchemaField',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true,
    },
    compileOptions: {
      type: Object as PropType<CompileOptions>,
      default: undefined,
    },
  },
  setup(props) {
    const form = inject(FormSymbol)
    if (!form) {
      throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用')
    }

    const compiled = computed(() => compileSchema(props.schema, props.compileOptions))

    return () => {
      const topLevelFields = Array.from(compiled.value.fields.entries()).filter(
        ([path]) => !path.includes('.'),
      )

      return topLevelFields.map(([path, compiledField]) => {
        if (compiledField.isVoid) {
          return null
        }

        if (compiledField.isArray) {
          const fieldProps = toArrayFieldProps(compiledField)
          return h(FormArrayField, {
            key: path,
            name: path,
            fieldProps,
          })
        }

        const fieldProps = toFieldProps(compiledField)
        return h(FormField, {
          key: path,
          name: path,
          fieldProps,
        })
      })
    }
  },
})
