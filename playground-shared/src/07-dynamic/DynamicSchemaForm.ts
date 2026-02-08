import type { SceneConfig } from '../types'

/** 城市选项 */
const CITY_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
]

const config: SceneConfig = {
  title: '动态 Schema',
  description: 'mergeSchema 合并 / 场景切换 / 热更新',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    idCard: '',
    city: undefined,
    companyName: '',
    creditCode: '',
    school: '',
    studentId: '',
    major: '',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
    },
    properties: {
      name: { type: 'string', title: '姓名', required: true },
      phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      remark: { type: 'string', title: '备注', component: 'Textarea' },
    },
  },

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] },
    { name: 'phone', label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'idCard', label: '身份证', required: true, component: 'Input', description: '个人用户场景' },
    { name: 'city', label: '城市', component: 'Select', dataSource: CITY_OPTIONS, description: '个人用户场景' },
    { name: 'companyName', label: '公司名称', required: true, component: 'Input', description: '企业用户场景' },
    { name: 'creditCode', label: '信用代码', required: true, component: 'Input', description: '企业用户场景' },
    { name: 'school', label: '学校', required: true, component: 'Input', description: '学生认证场景' },
    { name: 'studentId', label: '学号', required: true, component: 'Input', description: '学生认证场景' },
    { name: 'major', label: '专业', required: true, component: 'Input', description: '学生认证场景' },
    { name: 'remark', label: '备注', component: 'Textarea' },
  ],
}

export default config
