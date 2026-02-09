import type { FormGraph } from '@moluoxixi/core'
import type { SceneConfig } from '../types'
import { onFieldMount } from '@moluoxixi/core'

/**
 * 场景：Form Graph 序列化（状态快照与恢复）
 *
 * 演示 form.getGraph() / form.setGraph() 能力：
 * - 导出完整表单状态快照（values + 字段状态）
 * - 从快照恢复表单状态
 * - 快照包含时间戳，支持多版本管理
 *
 * 核心功能覆盖：
 * - FormGraph 类型
 * - form.getGraph() 序列化
 * - form.setGraph() 反序列化
 * - Effects API（onFieldMount）
 */

/** 缓存的快照（模拟持久化存储） */
let savedSnapshot: FormGraph | null = null

const config: SceneConfig = {
  title: 'Form Graph 状态快照',
  description: 'getGraph / setGraph — 导出快照、恢复快照、草稿保存',

  initialValues: {
    title: '',
    description: '',
    category: '',
    priority: '',
    snapshotInfo: '尚未保存快照',
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
      snapshotInfo: {
        type: 'string',
        title: '快照信息',
        component: 'Textarea',
        readOnly: true,
        componentProps: { rows: 4 },
        description: '显示 getGraph() 返回的快照摘要（点击提交保存快照，点击重置恢复快照）',
      },
    },
  },

  effects: (form) => {
    /**
     * 劫持提交行为：将提交变为保存快照。
     * 在实际业务中，getGraph() 的结果可以持久化到 localStorage 或后端。
     */
    form.on({ type: 'onFormSubmitStart' } as never, () => {
      savedSnapshot = form.getGraph()
      const info = [
        `快照已保存 (${new Date(savedSnapshot.timestamp).toLocaleTimeString()})`,
        `字段数: ${Object.keys(savedSnapshot.fields).length}`,
        `values: ${JSON.stringify(savedSnapshot.values, null, 2).slice(0, 200)}`,
      ].join('\n')
      form.setFieldState('snapshotInfo', { value: info })
    })

    /**
     * 劫持重置行为：从快照恢复。
     * setGraph() 会恢复 values 和所有字段状态。
     */
    form.on({ type: 'onFormReset' } as never, () => {
      if (savedSnapshot) {
        form.setGraph(savedSnapshot)
        form.setFieldState('snapshotInfo', {
          value: `已从快照恢复 (原保存时间: ${new Date(savedSnapshot.timestamp).toLocaleTimeString()})`,
        })
      }
      else {
        form.setFieldState('snapshotInfo', { value: '没有已保存的快照' })
      }
    })

    onFieldMount(form, 'snapshotInfo', () => {
      form.setFieldState('snapshotInfo', {
        value: savedSnapshot
          ? `存在已保存的快照 (${new Date(savedSnapshot.timestamp).toLocaleTimeString()})，点击「重置」恢复`
          : '尚未保存快照，填写表单后点击「提交」保存快照',
      })
    })
  },
}

export default config
