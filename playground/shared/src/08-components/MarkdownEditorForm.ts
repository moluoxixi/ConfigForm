import type { SceneConfig } from '../types'

/** 默认 Markdown 内容 */
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'

const config: SceneConfig = {
  title: 'Markdown 编辑器',
  description: 'Markdown 编写 + 实时预览',

  initialValues: {
    docTitle: '使用指南',
    content: DEFAULT_MD,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      docTitle: { type: 'string', title: '文档标题', required: true, componentProps: { placeholder: '请输入文档标题' } },
      content: { type: 'string', title: 'Markdown', required: true, component: 'MarkdownEditor' },
    },
  },
}

export default config
