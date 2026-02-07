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
    const result = ref('')
    const isError = computed(() => result.value.startsWith('验证失败'))

    /** 显示提交结果（JSON 格式） */
    function showResult(data: Record<string, unknown>): void {
      result.value = JSON.stringify(data, null, 2)
    }

    /** 显示验证错误列表 */
    function showErrors(errors: Array<{ path: string, message: string }>): void {
      result.value = `验证失败:\n${errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`
    }

    expose({ mode, result, showResult, showErrors })

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
      slots.default?.({ mode: mode.value, showResult }),

      /* 结果展示 */
      result.value
        ? h(AAlert, {
            type: isError.value ? 'error' : 'success',
            message: props.resultTitle,
            description: h('pre', { style: 'margin: 0; white-space: pre-wrap; font-size: 13px' }, result.value),
            showIcon: true,
            style: 'margin-top: 16px',
          })
        : null,
    ]
  },
})
