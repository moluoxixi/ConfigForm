import type { SceneConfig } from '../types'

/**
 * 场景：分区表单（LayoutCard 视觉分组 + 分区验证）
 *
 * 演示通过 void + LayoutCard 将表单分为多个逻辑区域：
 * - 订单信息区：订单名称、客户、金额
 * - 联系人信息区：联系人、电话、邮箱
 * - 提交时两个区域统一验证
 *
 * 注意：这是单表单的视觉分组，不是多表单协作（SubForm）。
 * 多表单协作需要通过 lowerCodePlugin.subForm 配置 mountPath 和 syncMode。
 */

const config: SceneConfig = {
  title: '分区表单',
  description: 'LayoutCard 视觉分组 + 分区验证 — 单表单内的逻辑区域划分',

  initialValues: {
    orderName: '',
    customer: '',
    total: 0,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      orderSection: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '订单信息' },
        properties: {
          orderName: { type: 'string', title: '订单名称', required: true },
          customer: { type: 'string', title: '客户', required: true },
          total: { type: 'number', title: '金额', required: true, componentProps: { min: 0, style: 'width: 100%' } },
        },
      },
      contactSection: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '联系人信息' },
        properties: {
          contactName: { type: 'string', title: '联系人', required: true },
          contactPhone: { type: 'string', title: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
          contactEmail: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
        },
      },
    },
  },
}

export default config
