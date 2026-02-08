import type { SceneConfig } from '../types'

/**
 * 场景：撤销重做
 *
 * 演示 undo/redo 操作栈能力。
 * 通过 form.onValuesChange 监听值变化，维护历史快照栈支持撤销/重做。
 * 支持 Ctrl+Z 撤销、Ctrl+Shift+Z 重做快捷键。
 */

const config: SceneConfig = {
  title: '撤销重做',
  description: 'undo/redo 操作栈 — ConfigForm + Schema 实现',

  initialValues: {
    title: '',
    category: '',
    amount: 0,
    note: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true },
      category: { type: 'string', title: '分类' },
      amount: { type: 'number', title: '金额', componentProps: { style: 'width: 100%' } },
      note: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 3 } },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input' },
    { name: 'category', label: '分类', component: 'Input' },
    { name: 'amount', label: '金额', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
    { name: 'note', label: '备注', component: 'Textarea', componentProps: { rows: 3 } },
  ],
}

export default config
