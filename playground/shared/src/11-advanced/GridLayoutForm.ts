import type { SceneConfig } from '../types'

/**
 * 场景：Grid 栅格布局
 *
 * 演示 CSS Grid 24 列栅格布局能力。
 * 通过 span 属性控制每个字段占据的列数，实现灵活的多列表单排列。
 */

/** 省份选项 */
const PROVINCE_OPTIONS = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' },
]

const config: SceneConfig = {
  title: 'Grid 栅格布局',
  description: '通过 span 属性控制字段宽度，24 列栅格系统，支持多列排列',

  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    age: undefined,
    address: '',
    province: undefined,
    city: '',
    zipCode: '',
    phone: '',
    notification: false,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'top',
      labelWidth: 'auto',
      actions: { submit: '提交', reset: '重置' },
      grid: true,
      gridColumns: 24,
      gridGap: '16px',
    },
    properties: {
      firstName: { type: 'string', title: '姓', required: true, span: 12, componentProps: { placeholder: '请输入姓氏' } },
      lastName: { type: 'string', title: '名', required: true, span: 12, componentProps: { placeholder: '请输入名字' } },
      email: { type: 'string', title: '邮箱', span: 16, rules: [{ format: 'email', message: '请输入有效邮箱' }], componentProps: { placeholder: 'user@example.com' } },
      age: { type: 'number', title: '年龄', span: 8, componentProps: { min: 0, max: 150 } },
      address: { type: 'string', title: '详细地址', span: 24, component: 'Textarea', componentProps: { placeholder: '请输入详细地址', rows: 2 } },
      province: { type: 'string', title: '省份', span: 8, enum: PROVINCE_OPTIONS },
      city: { type: 'string', title: '城市', span: 8, componentProps: { placeholder: '请输入城市' } },
      zipCode: { type: 'string', title: '邮编', span: 8, componentProps: { placeholder: '100000' } },
      phone: { type: 'string', title: '手机号', span: 12, rules: [{ format: 'phone', message: '请输入有效手机号' }] },
      notification: { type: 'boolean', title: '接收通知', span: 12 },
    },
  },
}

export default config
