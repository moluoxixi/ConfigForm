import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：撤销重做
 *
 * 演示 lowerCodePlugin 的 history 能力：
 * - 值变化时自动记录快照（内置）
 * - Ctrl+Z 撤销 / Ctrl+Y 重做（内置）
 * - 历史记录数量可配置
 *
 * 无需任何 effects，插件自动处理一切。
 */

const config: SceneConfig = {
  title: '撤销重做',
  description: '自动快照 + Ctrl+Z 撤销 / Ctrl+Y 重做（插件内置，零配置）',

  initialValues: {
    title: '',
    category: '',
    amount: 0,
    note: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: { type: 'string', title: '标题', required: true },
      category: { type: 'string', title: '分类' },
      amount: { type: 'number', title: '金额', componentProps: { style: 'width: 100%' } },
      note: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 3 } },
    },
  },

  plugins: [
    lowerCodePlugin({
      history: { maxLength: 30 },
      dirtyChecker: false,
      acl: false,
      submitRetry: false,
      subForm: false,
    }),
  ],
}

export default config
