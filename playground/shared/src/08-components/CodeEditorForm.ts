import type { SceneConfig } from '../types'

/**
 * 场景：代码编辑器
 *
 * 自定义组件 CodeEditor — 等宽字体 textarea + 语言标识 + 行数统计。
 * 组件在 playground/react 中实现并注册。
 */

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
]

const DEFAULT_CODE = 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));'

const config: SceneConfig = {
  title: '代码编辑器',
  description: '自定义组件 CodeEditor — 等宽字体 + 语言标识 + 行数统计',

  initialValues: {
    title: '代码片段',
    language: 'javascript',
    code: DEFAULT_CODE,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题', style: 'width: 250px' } },
      language: { type: 'string', title: '语言', enum: LANGUAGE_OPTIONS, componentProps: { style: 'width: 160px' } },
      code: { type: 'string', title: '代码', required: true, component: 'CodeEditor' },
    },
  },
}

export default config
