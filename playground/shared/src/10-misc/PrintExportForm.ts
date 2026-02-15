import type { SceneConfig } from '../types'

/**
 * 场景：打印 / 导入 / 导出（插件化）
 *
 * 交互入口由 playground 的 header toolbar 提供：
 * - 导出 JSON / CSV（下载）
 * - 导入 JSON / CSV（回填到表单）
 * - 打印（临时切到阅读态后调用浏览器打印）
 */
const config: SceneConfig = {
  title: '打印 / 导入 / 导出（插件化）',
  description: '通过 plugin-io 提供打印与导入导出能力，核心表单保持轻量',

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
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '100px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      orderNo: { type: 'string', title: '订单号', required: true },
      customer: { type: 'string', title: '客户', required: true },
      amount: {
        type: 'number',
        title: '金额',
        required: true,
        componentProps: { style: 'width: 100%' },
      },
      date: { type: 'string', title: '日期' },
      address: { type: 'string', title: '地址' },
      remark: {
        type: 'string',
        title: '备注',
        component: 'Textarea',
        componentProps: { rows: 2 },
      },
    },
  },
}

export default config
