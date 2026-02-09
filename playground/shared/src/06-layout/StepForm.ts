import type { SceneConfig } from '../types'

/**
 * 场景：分步表单
 *
 * 使用 LayoutCard 模拟分步流程，每步一个卡片。
 * 真正的 LayoutSteps 步骤导航需要组件支持步骤切换逻辑，
 * 当前使用 LayoutCard 展示分步结构。
 */

const config: SceneConfig = {
  title: '分步表单',
  description: 'LayoutCard 分步布局 / 步骤验证 / void 节点分步',

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
}

export default config
