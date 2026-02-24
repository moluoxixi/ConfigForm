import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

export const DesignerMaterialToolbarRenderer = defineComponent({
  name: 'DesignerMaterialToolbarRenderer',
  props: {
    keyword: { type: String, required: true },
    onKeywordChange: {
      type: Function as PropType<(nextKeyword: string) => void>,
      required: true,
    },
    totalCount: { type: Number, required: true },
    filteredCount: { type: Number, required: true },
  },

  /**
   * setup：执行当前位置的功能处理逻辑。
   * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/components/DesignerMaterialToolbarRenderer/index.ts:16`。
   * 功能：完成参数消化、业务分支处理及上下游结果传递。
   * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
   * @param props 参数 props 为当前逻辑所需的输入信息。
   * @returns 返回当前分支执行后的结果。
   */
  setup(props) {
    return () => h('div', {
      style: {
        display: 'grid',
        gap: '8px',
      },
    }, [
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        },
      }, [
        h('div', {
          style: {
            fontSize: '13px',
            fontWeight: 700,
            color: '#0f172a',
          },
        }, '物料'),
        h('div', {
          style: {
            border: '1px solid #d5e2f3',
            borderRadius: '999px',
            padding: '2px 8px',
            background: '#f8fbff',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
        }, '拖拽到画布'),
      ]),
      h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '8px',
          alignItems: 'center',
        },
      }, [
        h('input', {
          value: props.keyword,

          /**
           * onInput：执行当前位置的功能处理逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/components/DesignerMaterialToolbarRenderer/index.ts:62`。
           * 功能：完成参数消化、业务分支处理及上下游结果传递。
           * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
           * @param event 参数 event 为事件对象，承载当前交互上下文。
           */
          onInput: (event: Event) => {
            const target = event.target as HTMLInputElement | null
            props.onKeywordChange(target?.value ?? '')
          },
          placeholder: '搜索组件或布局',
          style: {
            border: '1px solid #dbe4f0',
            borderRadius: '8px',
            padding: '6px 8px',
            fontSize: '12px',
          },
        }),
        props.keyword
          ? h('button', {
              type: 'button',

              /**
               * onClick：执行当前位置的功能处理逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/components/DesignerMaterialToolbarRenderer/index.ts:78`。
               * 功能：完成参数消化、业务分支处理及上下游结果传递。
               * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
               */
              onClick: () => { props.onKeywordChange('') },
              style: {
                border: '1px solid #d0dbe9',
                borderRadius: '8px',
                background: '#fff',
                color: '#334155',
                fontSize: '12px',
                padding: '4px 10px',
                cursor: 'pointer',
              },
            }, '清空')
          : null,
      ]),
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: 0,
        },
      }, [
        h('span', {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid #d5e2f3',
            borderRadius: '999px',
            background: '#f8fbff',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
          },
        }, `全部 ${props.totalCount}`),
        h('span', {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid #d5e2f3',
            borderRadius: '999px',
            background: '#f8fbff',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
          },
        }, `筛选 ${props.filteredCount}`),
        h('span', {
          style: {
            marginLeft: 'auto',
            color: '#94a3b8',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }, '拖拽后可在画布调整顺序'),
      ]),
    ])
  },
})
