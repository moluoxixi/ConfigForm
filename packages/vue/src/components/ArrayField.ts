import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { useField } from '../composables'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

/**
 * Array Field：变量或常量声明。
 * 所属模块：`packages/vue/src/components/ArrayField.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const ArrayField = defineComponent({
  name: 'ArrayField',
  props: {
    itemsSchema: {
      type: Object as PropType<ISchema>,
      default: undefined,
    },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/ArrayField.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
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
          /**
           * default：执行当前功能逻辑。
           *
           * @returns 返回当前功能的处理结果。
           */

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
        /**
         * default：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

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
/**
 * Array Items：变量或常量声明。
 * 所属模块：`packages/vue/src/components/ArrayField.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const ArrayItems = ArrayField
