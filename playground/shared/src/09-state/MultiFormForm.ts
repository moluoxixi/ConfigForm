import type { SceneConfig } from '../types'

/**
 * 场景：多表单协作
 *
 * 演示两个独立表单的联合提交 / 弹窗表单复用 / 跨表单数据同步。
 * 主表单（订单信息）和子表单（联系人信息）各自独立管理，联合校验提交。
 */

const config: SceneConfig = {
  title: '多表单协作',
  description: '两个独立表单 / 联合提交 — ConfigForm + Schema 实现',

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
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '联合提交', reset: '重置' } },
    properties: {
      orderSection: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '主表单 - 订单信息' },
        properties: {
          orderName: { type: 'string', title: '订单名称', required: true },
          customer: { type: 'string', title: '客户', required: true },
          total: { type: 'number', title: '金额', required: true, componentProps: { min: 0, style: 'width: 100%' } },
        },
      },
      contactSection: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '子表单 - 联系人' },
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
