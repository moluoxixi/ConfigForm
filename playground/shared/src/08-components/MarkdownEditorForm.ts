import type { SceneConfig } from '../types'

/**
 * 场景：Markdown 编辑器
 *
 * 自定义组件 MarkdownEditor — 左侧编辑 + 右侧实时预览。
 * 组件在 playground/react 中实现并注册。
 */

const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'

const config: SceneConfig = {
  title: 'Markdown 编辑器',
  description: '自定义组件 MarkdownEditor — 编辑 + 实时预览',

  initialValues: {
    docTitle: '使用指南',
    content: DEFAULT_MD,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      docTitle: { type: 'string', title: '文档标题', required: true, componentProps: { placeholder: '请输入文档标题' } },
      content: { type: 'string', title: 'Markdown', required: true, component: 'MarkdownEditor' },
    },
  },
}

export default config
