import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：多表单协作（子表单插件）
 *
 * 演示 lowerCodePlugin 的 subForm 能力：
 * - 子表单挂载到父表单指定路径
 * - 双向/单向/手动同步模式
 * - 子表单独立验证
 * - 子表单验证失败阻止父表单提交
 */

const config: SceneConfig = {
  title: '多表单协作',
  description: 'lowerCodePlugin.subForm — 子表单挂载 / 同步 / 联合提交',

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

  plugins: [
    lowerCodePlugin({
      history: false,
      dirtyChecker: false,
      acl: false,
      submitRetry: false,
    }),
  ],
}

export default config
