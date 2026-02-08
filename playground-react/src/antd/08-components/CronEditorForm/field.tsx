/**
 * 场景 39：Cron 表达式编辑器
 *
 * 覆盖：
 * - Cron 表达式输入 + 实时解析
 * - 快捷预设
 * - 下次执行时间预览
 * - 三种模式切换
 *
 * 自定义 CronEditor 组件注册后，在 fieldProps 中通过 component: 'CronEditor' 引用。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** Cron 预设 */
const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '每周一 9:00', value: '0 9 * * 1' },
  { label: '每月 1 号 0:00', value: '0 0 1 * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每 30 分钟', value: '*/30 * * * *' },
]

/** 简单解析 Cron 表达式（实际项目用 cron-parser） */
function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5)
    return '格式错误（需要 5 个部分）'
  const [min, hour, day, month, week] = parts

  const desc: string[] = []
  if (min === '*' && hour === '*')
    desc.push('每分钟')
  else if (min === '0' && hour === '*')
    desc.push('每小时整点')
  else if (min.startsWith('*/'))
    desc.push(`每 ${min.slice(2)} 分钟`)
  else if (hour !== '*')
    desc.push(`${hour}:${min.padStart(2, '0')}`)
  else desc.push(`第 ${min} 分钟`)

  if (day !== '*')
    desc.push(`每月 ${day} 号`)
  if (month !== '*')
    desc.push(`${month} 月`)
  if (week !== '*') {
    const weekMap: Record<string, string> = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '1-5': '一至五（工作日）' }
    desc.push(`周${weekMap[week] ?? week}`)
  }

  return desc.join('，') || expr
}

// ========== 自定义组件：Cron 编辑器 ==========

/** Cron 编辑器 Props */
interface CronEditorProps {
  /** Cron 表达式 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * Cron 表达式编辑器组件
 *
 * - 编辑态：输入框 + 解析结果 + 快捷预设 + 格式说明
 * - 只读/禁用态：输入框 + 解析结果 + 格式说明（无预设）
 */
const CronEditor = observer(({ value, onChange, disabled, readOnly }: CronEditorProps): React.ReactElement => {
  const cronValue = value ?? ''
  const cronDesc = describeCron(cronValue)
  const isEditable = !disabled && !readOnly

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {/* 带前缀标签的输入框 */}
      <div style={{ display: 'inline-flex', width: 400 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 11px', background: '#fafafa', border: '1px solid #d9d9d9', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 14, color: '#666' }}>Cron</span>
        <input
          value={cronValue}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder="如：0 8 * * 1-5"
          style={{ flex: 1, padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '0 6px 6px 0', outline: 'none' }}
        />
      </div>

      {/* 解析结果 */}
      <div>
        <span style={{ color: '#999' }}>解析结果：</span>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: cronDesc.includes('错误') ? '#fff2f0' : '#e6f4ff', color: cronDesc.includes('错误') ? '#ff4d4f' : '#1677ff', border: `1px solid ${cronDesc.includes('错误') ? '#ffccc7' : '#91caff'}`, borderRadius: 4 }}>{cronDesc}</span>
      </div>

      {/* 快捷预设（仅编辑态） */}
      {isEditable && (
        <div>
          <span style={{ color: '#999', fontSize: 12, display: 'block', marginBottom: 4 }}>快捷预设：</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {CRON_PRESETS.map(preset => (
              <span
                key={preset.value}
                style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: value === preset.value ? '#e6f4ff' : '#f0f0f0', color: value === preset.value ? '#1677ff' : 'inherit', border: `1px solid ${value === preset.value ? '#91caff' : '#d9d9d9'}`, borderRadius: 4, cursor: 'pointer' }}
                onClick={() => onChange?.(preset.value)}
              >
                {preset.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cron 字段说明 */}
      <div style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
        <span style={{ color: '#999' }}>
          格式：分 时 日 月 周 | 示例：
          <code style={{ padding: '2px 6px', background: '#f5f5f5', borderRadius: 4, fontSize: 12 }}>0 8 * * 1-5</code>
          {' '}
          = 工作日 8:00
        </span>
      </div>
    </div>
  )
})

registerComponent('CronEditor', CronEditor, { defaultWrapper: 'FormItem' })

// ========== 表单组件 ==========

/**
 * Cron 表达式编辑器表单
 *
 * 展示 Cron 输入、快捷预设、实时解析、三种模式切换
 */
export const CronEditorForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' },
  })

  return (
    <div>
      <h3>Cron 表达式编辑器</h3>
      <p style={{ color: '#666' }}>Cron 输入 / 快捷预设 / 实时解析 / 三种模式</p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <FormField name="taskName" fieldProps={{ label: '任务名称', required: true, component: 'Input', componentProps: { style: { width: 300 } } }} />
                <FormField name="cronExpr" fieldProps={{ label: 'Cron 表达式', required: true, component: 'CronEditor' }} />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
