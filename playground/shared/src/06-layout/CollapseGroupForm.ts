import type { SceneConfig } from '../types'

/** 学历选项 */
const DEGREE_OPTIONS = [
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
]

const config: SceneConfig = {
  title: '折叠面板分组',
  description: 'Collapse 分组 / void 节点布局',

  initialValues: {
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    salary: undefined,
    school: '',
    major: '',
    degree: undefined,
    bio: '',
    hobby: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      basicCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '基本信息' },
        properties: {
          name: { type: 'string', title: '姓名', required: true },
          email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
          phone: { type: 'string', title: '手机号' },
        },
      },
      workCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '工作信息' },
        properties: {
          company: { type: 'string', title: '公司' },
          position: { type: 'string', title: '职位' },
          salary: { type: 'number', title: '薪资', componentProps: { min: 0, style: { width: '100%' } } },
        },
      },
      eduCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '教育经历' },
        properties: {
          school: { type: 'string', title: '学校' },
          major: { type: 'string', title: '专业' },
          degree: { type: 'string', title: '学历', enum: DEGREE_OPTIONS },
        },
      },
      otherCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '其他' },
        properties: {
          bio: { type: 'string', title: '简介', component: 'Textarea' },
          hobby: { type: 'string', title: '爱好' },
        },
      },
    },
  },

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } },
    { name: 'email', label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }], componentProps: { placeholder: '请输入邮箱' } },
    { name: 'phone', label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } },
    { name: 'company', label: '公司', component: 'Input', componentProps: { placeholder: '请输入公司' } },
    { name: 'position', label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } },
    { name: 'salary', label: '薪资', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } },
    { name: 'school', label: '学校', component: 'Input', componentProps: { placeholder: '请输入学校' } },
    { name: 'major', label: '专业', component: 'Input', componentProps: { placeholder: '请输入专业' } },
    { name: 'degree', label: '学历', component: 'Select', dataSource: DEGREE_OPTIONS, componentProps: { placeholder: '请选择学历' } },
    { name: 'bio', label: '简介', component: 'Textarea', componentProps: { placeholder: '请输入简介' } },
    { name: 'hobby', label: '爱好', component: 'Input', componentProps: { placeholder: '请输入爱好' } },
  ],
}

export default config
