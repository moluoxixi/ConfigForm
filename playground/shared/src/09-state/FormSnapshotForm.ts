import type { SceneConfig } from '../types'

/**
 * 场景：表单快照
 *
 * 演示暂存草稿 / 恢复草稿 / 多版本管理能力。
 * 草稿数据可持久化到 localStorage，支持多版本管理。
 */

/** 优先级选项 */
const PRIORITY_OPTIONS = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

const config: SceneConfig = {
  title: '表单快照',
  description: '暂存草稿 / 恢复草稿 — ConfigForm + Schema 实现',

  initialValues: {
    title: '',
    description: '',
    category: '',
    priority: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true },
      description: { type: 'string', title: '描述', component: 'Textarea', componentProps: { rows: 3 } },
      category: { type: 'string', title: '分类' },
      priority: { type: 'string', title: '优先级', enum: PRIORITY_OPTIONS },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input' },
    { name: 'description', label: '描述', component: 'Textarea', componentProps: { rows: 3 } },
    { name: 'category', label: '分类', component: 'Input' },
    { name: 'priority', label: '优先级', component: 'Input' },
  ],
}

export default config
