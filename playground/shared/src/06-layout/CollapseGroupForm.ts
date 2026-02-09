import type { SceneConfig } from '../types'

/** 学历选项 */
const DEGREE_OPTIONS = [
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
]

/**
 * 场景：折叠面板分组
 *
 * 使用 LayoutCard 模拟折叠面板分组。
 * LayoutCollapse 组件对子节点结构有特殊要求，
 * 当前使用 LayoutCard 展示分组效果。
 */

const config: SceneConfig = {
  title: '折叠面板分组',
  description: 'LayoutCard 分组 / void 节点布局',

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
}

export default config
