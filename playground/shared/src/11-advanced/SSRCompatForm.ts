import type { SceneConfig } from '../types'

/**
 * 场景：SSR 兼容性测试
 *
 * 验证表单核心功能在无浏览器环境下正常工作。
 * - createForm 不依赖 window/document
 * - Schema 编译正常
 * - Field 创建和验证不依赖 DOM
 * - 支持 hydration 场景
 */

const config: SceneConfig = {
  title: 'SSR 兼容性测试',
  description: '验证表单核心功能在无浏览器环境下正常工作，无 window/document 强依赖，支持 hydration 场景',

  initialValues: {
    username: 'ssr-test',
    email: 'test@example.com',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交' } },
    properties: {
      username: { type: 'string', title: '用户名', required: true },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
    },
  },

  fields: [
    { name: 'username', label: '用户名', required: true, component: 'Input' },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email' }] },
  ],
}

export default config
