import type { SceneConfig } from '../types'

/**
 * 场景：分步表单
 *
 * 使用 LayoutSteps 实现真正的步骤导航：
 * - steps (void + LayoutSteps) 作为容器
 * - 每个子 void 节点的 componentProps.title 作为步骤标题
 * - 一次只显示当前步骤的字段
 * - 上一步/下一步按钮自动渲染
 */

const config: SceneConfig = {
  title: '分步表单',
  description: 'LayoutSteps 步骤导航 / 逐步填写 / void 节点分步',

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
      steps: {
        type: 'void',
        component: 'LayoutSteps',
        componentProps: { labels: ['基本信息', '工作信息'] },
        properties: {
          step1: {
            type: 'void',
            componentProps: { title: '基本信息' },
            properties: {
              name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
              phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
              email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
            },
          },
          step2: {
            type: 'void',
            componentProps: { title: '工作信息' },
            properties: {
              company: { type: 'string', title: '公司', required: true },
              position: { type: 'string', title: '职位', required: true },
            },
          },
        },
      },
    },
  },
}

export default config
