import type { SceneConfig } from '../types'

/**
 * 场景：Grid 栅格布局
 *
 * 演示通过 schema.layout 配置 CSS Grid 多列布局。
 * 使用 layout.columns 控制列数，字段自动填充网格。
 */

/** 省份选项 */
const PROVINCE_OPTIONS = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' },
]

const config: SceneConfig = {
  title: 'Grid 栅格布局',
  description: '通过 layout.columns 控制列数，多列表单自动排列',

  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    age: undefined,
    province: undefined,
    city: '',
    zipCode: '',
    phone: '',
    notification: false,
  },

  schema: {
    type: 'object',
    layout: { type: 'grid', columns: 2, gutter: 16 },
    decoratorProps: {
      // labelPosition: 'top',
      // labelWidth: '100px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      firstName: { type: 'string', title: '姓', required: true, componentProps: { placeholder: '请输入姓氏' } },
      lastName: { type: 'string', title: '名', required: true, componentProps: { placeholder: '请输入名字' } },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '请输入有效邮箱' }], componentProps: { placeholder: 'user@example.com' } },
      age: { type: 'number', title: '年龄', componentProps: { min: 0, max: 150 } },
      province: { type: 'string', title: '省份', enum: PROVINCE_OPTIONS },
      city: { type: 'string', title: '城市', componentProps: { placeholder: '请输入城市' } },
      zipCode: { type: 'string', title: '邮编', componentProps: { placeholder: '100000' } },
      phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '请输入有效手机号' }] },
      notification: { type: 'boolean', title: '接收通知' },
    },
  },
}

export default config
