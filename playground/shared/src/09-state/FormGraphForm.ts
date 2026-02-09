import type { SceneConfig } from '../types'
import type { FormInstance } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'

/**
 * 场景：表单状态快照
 *
 * 演示 Form.getGraph() / Form.setGraph() 的状态序列化能力：
 * - getGraph：导出完整的表单状态快照（values + 字段状态）
 * - setGraph：从快照恢复表单状态
 * - 快照包含字段的 display / disabled / errors / component 等状态
 * - 可用于草稿保存、状态对比、时间旅行调试
 */

const config: SceneConfig = {
  title: '表单状态快照',
  description: 'getGraph / setGraph — 序列化/反序列化完整表单状态',

  initialValues: {
    title: '测试标题',
    content: '这是内容',
    priority: 'medium',
    graphJson: '',
  },

  effects: (form: FormInstance): void => {
    form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
      /**
       * 挂载后延迟获取初始快照，写入 graphJson 字段展示。
       * 使用 setTimeout 确保所有字段都已初始化。
       */
      setTimeout(() => {
        const graph = form.getGraph()
        const graphField = form.getField('graphJson')
        if (graphField) {
          graphField.setValue(JSON.stringify(graph, null, 2))
        }
      }, 100)
    })
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: {
        type: 'string',
        title: '标题',
        required: true,
        componentProps: { placeholder: '修改后可导出快照对比' },
      },
      content: {
        type: 'string',
        title: '内容',
        component: 'Textarea',
        componentProps: { rows: 2 },
      },
      priority: {
        type: 'string',
        title: '优先级',
        enum: [
          { label: '高', value: 'high' },
          { label: '中', value: 'medium' },
          { label: '低', value: 'low' },
        ],
      },
      graphJson: {
        type: 'string',
        title: '状态快照 (JSON)',
        description: '这里展示 form.getGraph() 导出的完整状态。修改上方字段后提交可观察差异。',
        component: 'Textarea',
        preview: true,
        componentProps: { rows: 8, style: 'font-family: monospace; font-size: 12px' },
      },
    },
  },
}

export default config
