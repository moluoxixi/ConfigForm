import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：草稿保存与快照恢复
 *
 * 演示 lowerCodePlugin 的 draft + history 联合能力：
 * - 自动保存草稿到 localStorage（防抖 2s）
 * - 页面刷新后恢复草稿
 * - 提交成功后清除草稿
 * - 历史快照与草稿协作
 */

const config: SceneConfig = {
  title: '草稿保存与快照',
  description: 'lowerCodePlugin.draft + history — 自动保存 / 恢复草稿 / 快照',

  initialValues: {
    title: '',
    description: '',
    category: '',
    priority: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true },
      description: { type: 'string', title: '描述', component: 'Textarea', componentProps: { rows: 3 } },
      category: { type: 'string', title: '分类', enum: [
        { label: '技术', value: 'tech' },
        { label: '产品', value: 'product' },
        { label: '设计', value: 'design' },
      ] },
      priority: { type: 'string', title: '优先级', enum: [
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
      ] },
    },
  },

  plugins: [
    lowerCodePlugin({
      history: { maxLength: 20 },
      draft: { key: 'snapshot-demo', debounceMs: 2000 },
      acl: false,
      submitRetry: false,
      subForm: false,
    }),
  ],
}

export default config
