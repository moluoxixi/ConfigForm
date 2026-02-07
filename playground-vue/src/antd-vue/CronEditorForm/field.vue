<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Cron 输入 / 快捷预设 / 实时解析
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="taskName" :field-props="{ label: '任务名称', required: true, component: 'Input', componentProps: { placeholder: '请输入任务名称', style: 'width: 300px' } }" />
          <FormField name="cronExpr" :field-props="{ label: 'Cron 表达式', required: true, component: 'CronEditor', componentProps: { presets: CRON_PRESETS } }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== Cron 解析工具 ==========

/** Cron 预设选项 */
interface CronPreset {
  label: string
  value: string
}

/** 快捷预设列表 */
const CRON_PRESETS: CronPreset[] = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '工作日 9:00', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
]

/** 星期中文映射 */
const WEEK_MAP: Record<string, string> = { '0': '日', '1': '一', '1-5': '一至五（工作日）' }

/**
 * 解析 Cron 表达式为中文描述
 *
 * @param expr - 5 段式 Cron 表达式（分 时 日 月 周）
 * @returns 中文描述
 */
function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return '格式错误'

  const [min, hour, , , week] = parts
  const descriptions: string[] = []

  if (min === '*' && hour === '*') {
    descriptions.push('每分钟')
  }
  else if (min === '0' && hour === '*') {
    descriptions.push('每小时整点')
  }
  else if (min.startsWith('*/')) {
    descriptions.push(`每 ${min.slice(2)} 分钟`)
  }
  else if (hour !== '*') {
    descriptions.push(`${hour}:${min.padStart(2, '0')}`)
  }

  if (week !== '*') {
    descriptions.push(`周${WEEK_MAP[week] ?? week}`)
  }

  return descriptions.join('，') || expr
}

// ========== 自定义组件：Cron 编辑器 ==========

/**
 * Cron 表达式编辑器组件
 *
 * - 编辑态：Cron 输入框 + 实时解析 + 快捷预设 + 格式说明
 * - 只读态：表达式文本 + 解析结果
 * - 禁用态：输入框禁用 + 解析结果
 */
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

      /* 解析结果标签 */
      const descriptionTag = h('div', { style: { marginTop: '8px' } }, [
        h('span', { style: { color: '#999' } }, '解析：'),
        h('span', {
          style: {
            display: 'inline-block',
            padding: '0 7px',
            fontSize: '12px',
            lineHeight: '20px',
            background: isError ? '#fff2f0' : '#e6f4ff',
            border: `1px solid ${isError ? '#ffccc7' : '#91caff'}`,
            borderRadius: '4px',
            color: isError ? '#ff4d4f' : '#1677ff',
          },
        }, description),
      ])

      /* 格式说明 */
      const formatHint = h('div', {
        style: {
          background: '#f6f8fa',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          marginTop: '8px',
          color: '#999',
        },
      }, [
        '格式：分 时 日 月 周 | 示例：',
        h('code', { style: { background: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' } }, '0 8 * * 1-5'),
        ' = 工作日 8:00',
      ])

      /* 只读态：文本 + 解析 + 格式说明 */
      if (props.readOnly) {
        return h('div', {}, [
          h('span', {}, currentValue || '—'),
          descriptionTag,
          formatHint,
        ])
      }

      /* 编辑态 / 禁用态 */
      const children = [
        /* Cron 输入框 */
        h('div', { style: { display: 'flex', alignItems: 'center' } }, [
          h('span', {
            style: {
              padding: '4px 11px',
              background: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              fontSize: '14px',
              color: '#666',
            },
          }, 'Cron'),
          h('input', {
            type: 'text',
            value: currentValue,
            disabled: props.disabled,
            placeholder: '如：0 8 * * 1-5',
            style: {
              width: '340px',
              padding: '4px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: '0 6px 6px 0',
              fontSize: '14px',
              outline: 'none',
            },
            onInput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value),
          }),
        ]),
        descriptionTag,
      ]

      /* 快捷预设（仅编辑态可点击） */
      if (!props.disabled && props.presets.length > 0) {
        children.push(
          h('div', { style: { marginTop: '8px' } }, [
            h('span', { style: { color: '#999', fontSize: '12px' } }, '快捷预设：'),
            h('span', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: '4px' } },
              props.presets.map(p =>
                h('span', {
                  key: p.value,
                  style: {
                    display: 'inline-block',
                    padding: '0 7px',
                    fontSize: '12px',
                    lineHeight: '20px',
                    background: props.value === p.value ? '#e6f4ff' : '#fafafa',
                    border: `1px solid ${props.value === p.value ? '#91caff' : '#d9d9d9'}`,
                    borderRadius: '4px',
                    color: props.value === p.value ? '#1677ff' : '#333',
                    cursor: 'pointer',
                  },
                  onClick: () => props.onChange?.(p.value),
                }, p.label),
              ),
            ),
          ]),
        )
      }

      children.push(formatHint)

      return h('div', {}, children)
    }
  },
})

registerComponent('CronEditor', CronEditor, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    taskName: '数据同步',
    cronExpr: '0 8 * * 1-5',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
