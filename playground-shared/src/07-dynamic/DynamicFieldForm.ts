import type { SceneConfig } from '../types'

/** 可选字段选项 */
const FIELD_OPTIONS = [
  { label: '姓名', value: 'name' },
  { label: '邮箱', value: 'email' },
  { label: '电话', value: 'phone' },
  { label: '公司', value: 'company' },
  { label: '职位', value: 'position' },
  { label: '备注', value: 'remark' },
]

const config: SceneConfig = {
  title: '动态增删字段',
  description: '预设字段组合 / Schema 切换',

  initialValues: {
    _selectedFields: ['name', 'email'],
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '100px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      _selectedFields: {
        type: 'string',
        title: '显示字段',
        component: 'CheckboxGroup',
        default: ['name', 'email'],
        dataSource: FIELD_OPTIONS,
      },
      name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', title: '电话', rules: [{ format: 'phone', message: '无效手机号' }] },
      company: { type: 'string', title: '公司' },
      position: { type: 'string', title: '职位' },
      remark: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 3 } },
    },
  },

  fields: [
    { name: 'title', label: '表单标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } },
  ],
}

export default config
