import type { SceneConfig } from '../types'

/** 默认 JSON 内容 */
const DEFAULT_JSON = JSON.stringify({ name: '张三', age: 28, roles: ['admin'] }, null, 2)

const config: SceneConfig = {
  title: 'JSON 编辑器',
  description: 'JSON 编辑 + 格式化 + 语法检查',

  initialValues: {
    configName: 'API 配置',
    jsonContent: DEFAULT_JSON,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      configName: { type: 'string', title: '配置名称', required: true, componentProps: { placeholder: '请输入配置名称' } },
      jsonContent: { type: 'string', title: 'JSON 内容', required: true, component: 'JsonEditor' },
    },
  },
}

export default config
