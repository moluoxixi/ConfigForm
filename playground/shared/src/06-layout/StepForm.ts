import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '分步表单',
  description: 'Steps 导航 / 步骤验证 / void 节点分步',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      step1: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '第 1 步：基本信息' },
        properties: {
          name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
          phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
          email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
        },
      },
      step2: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '第 2 步：工作信息' },
        properties: {
          company: { type: 'string', title: '公司', required: true },
          position: { type: 'string', title: '职位', required: true },
        },
      },
    },
  },

  fields: [
    { name: 'name', label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] },
    { name: 'phone', label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'email', label: '邮箱', required: true, component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'company', label: '公司', required: true, component: 'Input' },
    { name: 'position', label: '职位', required: true, component: 'Input' },
  ],
}

export default config
