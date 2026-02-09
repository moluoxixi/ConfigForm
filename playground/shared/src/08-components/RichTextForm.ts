import type { SceneConfig } from '../types'

/**
 * 场景：富文本编辑器
 *
 * 自定义组件 RichTextEditor — contentEditable + 工具栏（加粗/斜体/下划线）。
 * 组件在 playground/react 中实现并注册。
 */

const DEFAULT_HTML = '<h2>标题</h2><p>这是<strong>富文本</strong>内容，支持<em>斜体</em>和<u>下划线</u>。</p>'

const config: SceneConfig = {
  title: '富文本编辑器',
  description: '自定义组件 RichTextEditor — contentEditable + 工具栏',

  initialValues: {
    title: '示例文章',
    content: DEFAULT_HTML,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题' } },
      content: { type: 'string', title: '正文', required: true, component: 'RichTextEditor' },
    },
  },
}

export default config
