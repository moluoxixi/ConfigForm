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

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] },
    { name: 'phone', label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'department', label: '部门', required: true, component: 'Select', dataSource: DEPARTMENT_OPTIONS, description: '员工入职模板' },
    { name: 'position', label: '职位', required: true, component: 'Input', description: '员工入职模板' },
    { name: 'company', label: '所属公司', component: 'Input', description: '客户登记模板' },
    { name: 'level', label: '等级', component: 'Select', dataSource: LEVEL_OPTIONS, description: '客户登记模板' },
    { name: 'companyName', label: '公司名称', required: true, component: 'Input', description: '供应商注册模板' },
    { name: 'creditCode', label: '信用代码', required: true, component: 'Input', description: '供应商注册模板' },
    { name: 'province', label: '省份', component: 'Select', dataSource: PROVINCE_OPTIONS },
    { name: 'city', label: '城市', component: 'Input' },
    { name: 'address', label: '详细地址', component: 'Textarea' },
    { name: 'remark', label: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
  ],
}

export default config
