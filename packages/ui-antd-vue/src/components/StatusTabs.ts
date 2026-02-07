import type { FieldPattern } from '@moluoxixi/shared'
import { Alert as AAlert, Segmented as ASegmented } from 'ant-design-vue'
import { computed, defineComponent, h, ref } from 'vue'

/** 三态选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '阅读态', value: 'readOnly' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

/**
 * 格式化值为可读字符串
 */
function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? '是' : '否'
  if (Array.isArray(val)) return val.length === 0 ? '—' : val.map(v => formatValue(v)).join(', ')
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return String(val)
}

/**
 * Playground 通用三态切换 + 结果展示容器
 *
 * 使用 ant-design-vue Segmented 组件实现模式切换，Alert 组件展示提交结果。
 * 不包含 ConfigForm / FormProvider 等表单逻辑，由各场景文件自行实现。
 */
export const StatusTabs = defineComponent({
  name: 'CfStatusTabs',
  props: {
    /** 结果区域标题 */
    resultTitle: { type: String, default: '提交结果' },
  },
  setup(props, { slots, expose }) {
    const mode = ref<FieldPattern>('editable')
    const resultData = ref<Record<string, unknown> | null>(null)
    const errorText = ref('')
    const isError = computed(() => !!errorText.value)

    /** 显示提交结果（结构化展示） */
    function showResult(data: Record<string, unknown>): void {
      resultData.value = data
      errorText.value = ''
    }

    /** 显示验证错误列表 */
    function showErrors(errors: Array<{ path: string, message: string }>): void {
      resultData.value = null
      errorText.value = errors.map(e => `[${e.path}] ${e.message}`).join('\n')
    }

    expose({ mode, showResult, showErrors })

    return () => [
      /* 三态切换 */
      h(ASegmented, {
        'options': MODE_OPTIONS,
        'value': mode.value,
        'onUpdate:value': (v: FieldPattern) => { mode.value = v },
        'onChange': (v: FieldPattern) => { mode.value = v },
        'style': 'margin-bottom: 16px',
      }),

      /* 表单内容（由场景文件填充） */
      slots.default?.({ mode: mode.value, showResult, showErrors }),

      /* 错误展示 */
      errorText.value
        ? h(AAlert, {
          type: 'error',
          message: '验证失败',
          description: h('pre', { style: 'margin: 0; white-space: pre-wrap; font-size: 13px; color: #ff4d4f' }, errorText.value),
          showIcon: true,
          style: 'margin-top: 16px',
        })
        : null,

      /* 成功结果展示（字段表格） */
      resultData.value
        ? h('div', { style: 'margin-top: 16px; border: 1px solid #b7eb8f; border-radius: 8px; overflow: hidden' }, [
          h('div', { style: 'padding: 8px 16px; background: #f6ffed; font-weight: 600; color: #52c41a; border-bottom: 1px solid #b7eb8f; display: flex; align-items: center; gap: 6px' }, [
            h('span', { style: 'font-size: 16px' }, '✓'),
            props.resultTitle,
          ]),
          h('table', { style: 'width: 100%; border-collapse: collapse; font-size: 13px' }, [
            h('thead', {}, h('tr', { style: 'background: #fafafa' }, [
              h('th', { style: 'padding: 8px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; color: #666; width: 180px' }, '字段'),
              h('th', { style: 'padding: 8px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; color: #666' }, '值'),
            ])),
            h('tbody', {}, Object.entries(resultData.value).map(([key, val], idx) =>
              h('tr', { key, style: idx % 2 === 1 ? 'background: #fafafa' : '' }, [
                h('td', { style: 'padding: 6px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 500; color: #333' }, key),
                h('td', { style: 'padding: 6px 16px; border-bottom: 1px solid #f0f0f0; color: #555; word-break: break-all' }, formatValue(val)),
              ]),
            )),
          ]),
        ])
        : null,
    ]
  },
})
