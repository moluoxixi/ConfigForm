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
 * 使用 LayoutCollapse 作为外层容器，内部 void 子节点作为各面板。
 * 与 TabGroupForm 结构对齐——容器 + 子面板模式。
 */

const config: SceneConfig = {
  title: '折叠面板分组',
  description: 'LayoutCollapse 折叠分组 / 点击标题展开折叠',

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
      collapse: {
        type: 'void',
        component: 'LayoutCollapse',
        properties: {
          basicPanel: {
            type: 'void',
            componentProps: { title: '基本信息' },
            properties: {
              name: { type: 'string', title: '姓名', required: true },
              email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
              phone: { type: 'string', title: '手机号' },
            },
          },
          workPanel: {
            type: 'void',
            componentProps: { title: '工作信息' },
            properties: {
              company: { type: 'string', title: '公司' },
              position: { type: 'string', title: '职位' },
              salary: { type: 'number', title: '薪资', componentProps: { min: 0, style: { width: '100%' } } },
            },
          },
          eduPanel: {
            type: 'void',
            componentProps: { title: '教育经历' },
            properties: {
              school: { type: 'string', title: '学校' },
              major: { type: 'string', title: '专业' },
              degree: { type: 'string', title: '学历', enum: DEGREE_OPTIONS },
            },
          },
          otherPanel: {
            type: 'void',
            componentProps: { title: '其他' },
            properties: {
              bio: { type: 'string', title: '简介', component: 'Textarea' },
              hobby: { type: 'string', title: '爱好' },
            },
          },
        },
      },
    },
  },
}

export default config
