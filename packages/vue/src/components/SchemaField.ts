import type { CompileOptions, FormSchema, GridLayout } from '@moluoxixi/schema'
import type { CSSProperties, PropType } from 'vue'
import { compileSchema, toArrayFieldProps, toFieldProps } from '@moluoxixi/schema'
import { computed, defineComponent, h, inject } from 'vue'
import { FormSymbol } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'

/**
 * 根据 schema.form.direction 和 schema.layout 计算容器 CSS
 */
function computeContainerStyle(direction?: string, layout?: FormSchema['layout']): CSSProperties {
  const style: CSSProperties = {}

  /* 栅格布局优先 */
  if (layout && layout.type === 'grid') {
    const grid = layout as GridLayout
    style.display = 'grid'
    style.gridTemplateColumns = `repeat(${grid.columns}, 1fr)`
    style.gap = `${grid.gutter ?? 16}px`
    return style
  }

  /* 行内布局：字段水平排列 */
  if (direction === 'inline') {
    style.display = 'flex'
    style.flexWrap = 'wrap'
    style.gap = '0 16px'
    style.alignItems = 'flex-start'
  }

  return style
}

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
      const formConfig = compiled.value.form
      const layoutSchema = compiled.value.layout
      const containerStyle = computeContainerStyle(formConfig.direction, layoutSchema)

      const topLevelFields = Array.from(compiled.value.fields.entries()).filter(
        ([path]) => !path.includes('.'),
      )

      const fieldElements = topLevelFields.map(([path, compiledField]) => {
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

      /* 如果有布局样式，包裹在容器 div 中 */
      if (Object.keys(containerStyle).length > 0) {
        return h('div', { style: containerStyle }, fieldElements)
      }

      return fieldElements
    }
  },
})
