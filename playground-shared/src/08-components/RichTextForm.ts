import type { SceneConfig } from '../types'

/** 默认富文本内容 */
const DEFAULT_HTML = '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>'

const config: SceneConfig = {
  title: '富文本编辑器',
  description: '富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）',

  initialValues: {
    title: '示例文章',
    content: DEFAULT_HTML,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题' } },
      content: { type: 'string', title: '正文', required: true, component: 'RichTextEditor' },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } },
    { name: 'content', label: '正文', required: true, component: 'RichTextEditor' },
  ],
}

export default config
