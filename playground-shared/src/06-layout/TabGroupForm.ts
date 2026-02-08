import type { SceneConfig } from '../types'

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术', value: 'tech' },
  { label: '产品', value: 'product' },
]

const config: SceneConfig = {
  title: '标签页切换分组',
  description: 'Tabs 分组 / 切换保留数据 / void 节点布局',

  initialValues: {
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    department: undefined,
    bio: '',
    website: '',
    github: '',
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
          company: { type: 'string', title: '公司', required: true },
          position: { type: 'string', title: '职位' },
          department: { type: 'string', title: '部门', enum: DEPARTMENT_OPTIONS },
        },
      },
      otherCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '其他' },
        properties: {
          bio: { type: 'string', title: '简介', component: 'Textarea', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
          website: { type: 'string', title: '网站', rules: [{ format: 'url', message: '无效 URL' }] },
          github: { type: 'string', title: 'GitHub' },
        },
      },
    },
  },

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } },
    { name: 'email', label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }], componentProps: { placeholder: '请输入邮箱' } },
    { name: 'phone', label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } },
    { name: 'company', label: '公司', required: true, component: 'Input', componentProps: { placeholder: '请输入公司' } },
    { name: 'position', label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } },
    { name: 'department', label: '部门', component: 'Select', dataSource: DEPARTMENT_OPTIONS, componentProps: { placeholder: '请选择' } },
    { name: 'bio', label: '简介', component: 'Textarea', rules: [{ maxLength: 200, message: '不超过 200 字' }], componentProps: { placeholder: '请输入简介' } },
    { name: 'website', label: '网站', component: 'Input', rules: [{ format: 'url', message: '无效 URL' }], componentProps: { placeholder: '请输入网站' } },
    { name: 'github', label: 'GitHub', component: 'Input', componentProps: { placeholder: '请输入 GitHub' } },
  ],
}

export default config
