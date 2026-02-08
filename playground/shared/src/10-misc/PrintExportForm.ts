import type { SceneConfig } from '../types'

/**
 * 场景：打印、导出
 *
 * 演示打印预览 / 导出 JSON / 导出 CSV 能力。
 * 通过 form.getFieldValue 读取表单值进行打印/导出操作。
 */

const config: SceneConfig = {
  title: '打印、导出',
  description: '打印预览 / 导出 JSON / 导出 CSV — ConfigForm + Schema 实现',

  initialValues: {
    orderNo: 'ORD-20260207-001',
    customer: '张三',
    amount: 9999,
    date: '2026-02-07',
    address: '北京市朝阳区',
    remark: '加急处理',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      orderNo: { type: 'string', title: '订单号' },
      customer: { type: 'string', title: '客户' },
      amount: { type: 'number', title: '金额', componentProps: { style: 'width: 100%' } },
      date: { type: 'string', title: '日期' },
      address: { type: 'string', title: '地址' },
      remark: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 2 } },
    },
  },

  fields: [
    { name: 'orderNo', label: '订单号', component: 'Input' },
    { name: 'customer', label: '客户', component: 'Input' },
    { name: 'amount', label: '金额', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
    { name: 'date', label: '日期', component: 'Input' },
    { name: 'address', label: '地址', component: 'Input' },
    { name: 'remark', label: '备注', component: 'Textarea', componentProps: { rows: 2 } },
  ],
}

export default config
