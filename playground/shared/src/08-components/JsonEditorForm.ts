import type { SceneConfig } from '../types'

/**
 * 场景：JSON 编辑器
 *
 * 自定义组件 JsonEditor — JSON 编辑 + 格式化按钮 + 实时语法检查。
 * 组件在 playground/react 中实现并注册。
 */

const DEFAULT_JSON = JSON.stringify({ name: '张三', age: 28, roles: ['admin', 'user'], settings: { theme: 'dark', lang: 'zh-CN' } }, null, 2)

const config: SceneConfig = {
  title: 'JSON 编辑器',
  description: '自定义组件 JsonEditor — 编辑 + 格式化 + 实时语法检查',

  initialValues: {
    configName: 'API 配置',
    jsonContent: DEFAULT_JSON,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      configName: { type: 'string', title: '配置名称', required: true, componentProps: { placeholder: '请输入配置名称' } },
      jsonContent: { type: 'string', title: 'JSON 内容', required: true, component: 'JsonEditor' },
    },
  },
}

export default config
