import type { SceneConfig } from '../types'

/**
 * 场景：生命周期钩子
 *
 * 演示 onMount / onChange / onSubmit / onReset / 自动保存等生命周期能力。
 * 通过 form.onValuesChange 监听值变化，支持自动保存到 localStorage。
 */

const config: SceneConfig = {
  title: '生命周期钩子',
  description: 'onMount / onChange / onSubmit / onReset — ConfigForm + Schema 实现',

  initialValues: {
    title: '生命周期测试',
    price: 99,
    description: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true },
      price: { type: 'number', title: '价格', componentProps: { style: 'width: 100%' } },
      description: { type: 'string', title: '描述', component: 'Textarea', componentProps: { rows: 3 } },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input' },
    { name: 'price', label: '价格', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
    { name: 'description', label: '描述', component: 'Textarea', componentProps: { rows: 3 } },
  ],
}

export default config
