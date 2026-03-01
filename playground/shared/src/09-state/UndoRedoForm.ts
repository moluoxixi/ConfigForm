import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '撤销 / 重做（History Plugin）',
  description: '输入后可使用 Ctrl/Cmd+Z 撤销，Ctrl+Y 或 Shift+Cmd+Z 重做。场景自动记录历史快照。',

  initialValues: {
    title: 'ConfigForm v1.0 发布评审',
    assignee: 'Alice',
    estimate: 3,
    note: '先修改几个字段，再使用快捷键体验撤销/重做。',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '160px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      title: {
        type: 'string',
        title: '任务标题',
        required: true,
        componentProps: { style: { width: '320px' } },
      },
      assignee: {
        type: 'string',
        title: '负责人',
        required: true,
        componentProps: { style: { width: '320px' } },
      },
      estimate: {
        type: 'number',
        title: '预估工时（天）',
        required: true,
        componentProps: { min: 0, style: { width: '320px' } },
      },
      note: {
        type: 'string',
        title: '备注',
        component: 'Textarea',
        componentProps: {
          rows: 4,
          style: { width: '420px' },
          placeholder: '尝试连续输入几次内容，再按撤销 / 重做快捷键',
        },
      },
    },
  },
}

export default config
