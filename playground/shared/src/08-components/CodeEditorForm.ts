import type { SceneConfig } from '../types'

/** 语言选项 */
const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
]

/** 默认代码片段 */
const DEFAULT_CODE = 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));'

const config: SceneConfig = {
  title: '代码编辑器',
  description: 'Textarea 模拟代码编辑器',

  initialValues: {
    title: '代码片段',
    language: 'javascript',
    code: DEFAULT_CODE,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题', style: 'width: 250px' } },
      language: { type: 'string', title: '语言', enum: LANGUAGE_OPTIONS, componentProps: { style: 'width: 160px' } },
      code: { type: 'string', title: '代码', required: true, component: 'CodeEditor' },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题', style: 'width: 250px' } },
    { name: 'language', label: '语言', component: 'Select', dataSource: LANGUAGE_OPTIONS, componentProps: { style: 'width: 160px' } },
    { name: 'code', label: '代码', required: true, component: 'CodeEditor' },
  ],
}

export default config
