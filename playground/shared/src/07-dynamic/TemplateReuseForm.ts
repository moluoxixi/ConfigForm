import type { SceneConfig } from '../types'

/** 省份选项 */
const PROVINCE_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
]

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术', value: 'tech' },
  { label: '产品', value: 'product' },
]

/** 等级选项 */
const LEVEL_OPTIONS = [
  { label: '普通', value: 'normal' },
  { label: 'VIP', value: 'vip' },
]

const config: SceneConfig = {
  title: '模板复用',
  description: 'Schema 片段复用 + 继承覆盖 = 不同业务表单',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    department: undefined,
    position: '',
    company: '',
    level: undefined,
    companyName: '',
    creditCode: '',
    province: undefined,
    city: '',
    address: '',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
    },
    properties: {
      name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      province: { type: 'string', title: '省份', enum: PROVINCE_OPTIONS },
      city: { type: 'string', title: '城市' },
      address: { type: 'string', title: '详细地址', component: 'Textarea' },
      remark: { type: 'string', title: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
    },
  },
}

export default config
