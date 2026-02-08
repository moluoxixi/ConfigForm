import type { SceneConfig } from '../types'

/**
 * 场景：可编辑表格
 *
 * 覆盖：表格行内编辑 / 数组字段 / 行级联动 / 列统计
 */

const config: SceneConfig = {
  title: '可编辑表格',
  description: '表格行内编辑 / 数组字段 / 行级联动 / 列统计',

  initialValues: {
    items: [
      { productName: '键盘', quantity: 2, unitPrice: 299 },
      { productName: '鼠标', quantity: 3, unitPrice: 99 },
    ],
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '120px' },
    properties: {
      items: {
        type: 'array',
        title: '订单明细',
        minItems: 1,
        maxItems: 20,
        itemTemplate: { productName: '', quantity: 1, unitPrice: 0 },
        items: {
          type: 'object',
          properties: {
            productName: { type: 'string', title: '商品', required: true, componentProps: { placeholder: '商品名称' } },
            quantity: { type: 'number', title: '数量', required: true, componentProps: { min: 1, placeholder: '数量' } },
            unitPrice: { type: 'number', title: '单价', required: true, componentProps: { min: 0, step: 0.01, placeholder: '单价' } },
          },
        },
      },
    },
  },

  fields: [
    { name: 'items', label: '订单明细', component: 'ArrayField', componentProps: { minItems: 1, maxItems: 20, itemTemplate: { productName: '', quantity: 1, unitPrice: 0 } } },
  ],
}

export default config
