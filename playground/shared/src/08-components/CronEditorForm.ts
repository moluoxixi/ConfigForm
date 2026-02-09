import type { SceneConfig } from '../types'

/**
 * 场景：Cron 表达式编辑器
 *
 * 自定义组件 CronEditor — 手动输入 + 快捷预设 + 实时解读。
 * 组件在 playground/react 中实现并注册。
 */

const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
]

const config: SceneConfig = {
  title: 'Cron 表达式编辑器',
  description: '自定义组件 CronEditor — 输入 + 预设 + 实时解读',

  initialValues: {
    taskName: '数据同步',
    cronExpr: '0 8 * * 1-5',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      taskName: { type: 'string', title: '任务名称', required: true, componentProps: { placeholder: '请输入任务名称', style: 'width: 300px' } },
      cronExpr: { type: 'string', title: 'Cron 表达式', required: true, component: 'CronEditor', componentProps: { presets: CRON_PRESETS } },
    },
  },
}

export default config
