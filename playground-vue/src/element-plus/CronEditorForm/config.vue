<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Cron 输入 / 快捷预设 / 实时解析 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * Cron 表达式编辑器 — Config 模式
 *
 * 自定义 CronEditor 组件注册后，在 schema 中通过 component: 'CronEditor' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupElementPlus()

/** Cron 预设选项 */
interface CronPreset { label: string; value: string }

const CRON_PRESETS: CronPreset[] = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
]

/** 解析 Cron 表达式为中文描述 */
function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return '格式错误'
  const [min, hour, , , week] = parts
  const descriptions: string[] = []
  if (min === '*' && hour === '*') descriptions.push('每分钟')
  else if (min === '0' && hour === '*') descriptions.push('每小时整点')
  else if (min.startsWith('*/')) descriptions.push(`每 ${min.slice(2)} 分钟`)
  else if (hour !== '*') descriptions.push(`${hour}:${min.padStart(2, '0')}`)
  if (week !== '*') descriptions.push(`周${week === '1-5' ? '一至五（工作日）' : week}`)
  return descriptions.join('，') || expr
}

/** Cron 编辑器组件 */
const CronEditor = defineComponent({
  name: 'CronEditor',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    presets: { type: Array as PropType<CronPreset[]>, default: () => [] },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      const currentValue = props.value ?? ''
      const description = describeCron(currentValue)
      const isError = description.includes('错误')
      const descTag = h('div', { style: { marginTop: '8px' } }, [
        h('span', { style: { color: '#999' } }, '解析：'),
        h('span', { style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', background: isError ? '#fff2f0' : '#e6f4ff', border: `1px solid ${isError ? '#ffccc7' : '#91caff'}`, borderRadius: '4px', color: isError ? '#ff4d4f' : '#1677ff' } }, description),
      ])
      if (props.readOnly) return h('div', {}, [h('span', {}, currentValue || '—'), descTag])
      const children = [
        h('div', { style: { display: 'flex', alignItems: 'center' } }, [
          h('span', { style: { padding: '4px 11px', background: '#fafafa', border: '1px solid #d9d9d9', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: '14px', color: '#666' } }, 'Cron'),
          h('input', { type: 'text', value: currentValue, disabled: props.disabled, placeholder: '如：0 8 * * 1-5', style: { width: '340px', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '0 6px 6px 0', fontSize: '14px', outline: 'none' }, onInput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value) }),
        ]),
        descTag,
      ]
      if (!props.disabled && props.presets.length > 0) {
        children.push(h('div', { style: { marginTop: '8px' } }, [
          h('span', { style: { color: '#999', fontSize: '12px' } }, '快捷预设：'),
          h('span', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: '4px' } }, props.presets.map(p =>
            h('span', { key: p.value, style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', background: props.value === p.value ? '#e6f4ff' : '#fafafa', border: `1px solid ${props.value === p.value ? '#91caff' : '#d9d9d9'}`, borderRadius: '4px', color: props.value === p.value ? '#1677ff' : '#333', cursor: 'pointer' }, onClick: () => props.onChange?.(p.value) }, p.label),
          )),
        ]))
      }
      return h('div', {}, children)
    }
  },
})

registerComponent('CronEditor', CronEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { taskName: '数据同步', cronExpr: '0 8 * * 1-5' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    taskName: { type: 'string', title: '任务名称', required: true, componentProps: { placeholder: '请输入任务名称', style: 'width: 300px' } },
    cronExpr: { type: 'string', title: 'Cron 表达式', required: true, component: 'CronEditor', componentProps: { presets: CRON_PRESETS } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
