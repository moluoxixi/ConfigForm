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
import { Input, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

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
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        value={cronValue}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        placeholder="如：0 8 * * 1-5"
        addonBefore="Cron"
        style={{ width: 400 }}
      />

      {/* 解析结果 */}
      <div>
        <Text type="secondary">解析结果：</Text>
        <Tag color={cronDesc.includes('错误') ? 'error' : 'blue'}>{cronDesc}</Tag>
      </div>

      {/* 快捷预设（仅编辑态） */}
      {isEditable && (
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>快捷预设：</Text>
          <Space wrap>
            {CRON_PRESETS.map(preset => (
              <Tag
                key={preset.value}
                color={value === preset.value ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => onChange?.(preset.value)}
              >
                {preset.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* Cron 字段说明 */}
      <div style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
        <Text type="secondary">
          格式：分 时 日 月 周 | 示例：
          <Text code>0 8 * * 1-5</Text>
          {' '}
          = 工作日 8:00
        </Text>
      </div>
    </Space>
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
      <Title level={3}>Cron 表达式编辑器</Title>
      <Paragraph type="secondary">Cron 输入 / 快捷预设 / 实时解析 / 三种模式</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="taskName" fieldProps={{ label: '任务名称', required: true, component: 'Input', componentProps: { style: { width: 300 } } }} />
                <FormField name="cronExpr" fieldProps={{ label: 'Cron 表达式', required: true, component: 'CronEditor' }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
