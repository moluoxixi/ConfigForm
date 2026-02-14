import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { RecursionField, useField } from '@moluoxixi/vue'
import { defineComponent, h } from 'vue'
import { ArrayBase } from './ArrayBase'

export const ArrayField = defineComponent({
  name: 'ArrayField',
  props: {
    itemsSchema: {
      type: Object as PropType<ISchema>,
      default: undefined,
    },
  },
  setup(props) {
    let field: ArrayFieldInstance
    try {
      field = useField() as unknown as ArrayFieldInstance
    }
    catch {
      return () => null
    }

    return () => {
      const arrayValue = Array.isArray(field.value) ? field.value : []
      const isEditable = field.editable
      const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

      const items: VNode[] = arrayValue.map((_, index) => {
        return h(ArrayBase.Item, { key: index, index }, {
          default: () => h('div', {
            style: {
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '8px',
              padding: '12px',
              background: index % 2 === 0 ? '#fafafa' : '#fff',
              borderRadius: '4px',
              border: '1px solid #ebeef5',
            },
          }, [
            h(ArrayBase.Index),
            h('div', { style: { flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' } }, props.itemsSchema
              ? [h(RecursionField, { schema: props.itemsSchema, name: index, basePath: field.path })]
              : [h('span', { style: { color: '#999' } }, `Item ${index}`)]),
            h('div', {
              style: {
                display: 'flex',
                gap: '4px',
                flexShrink: '0',
                visibility: isEditable ? 'visible' : 'hidden',
              },
            }, [
              h(ArrayBase.MoveUp),
              h(ArrayBase.MoveDown),
              h(ArrayBase.Remove),
            ]),
          ]),
        })
      })

      return h(ArrayBase, null, {
        default: () => h('div', { style: { width: '100%' } }, [
          h('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            },
          }, [
            h('span', { style: { fontWeight: 600, color: '#303133' } }, field.label || field.path),
            h('span', { style: { color: '#909399', fontSize: '13px' } }, `${arrayValue.length} / ${maxItems}`),
          ]),
          ...items,
          isEditable && h(ArrayBase.Addition),
        ]),
      })
    }
  },
})

/* 兼容旧命名 */
export const ArrayItems = ArrayField
