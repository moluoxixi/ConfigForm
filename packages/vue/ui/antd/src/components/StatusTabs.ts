import type { FieldPattern } from '@moluoxixi/core'
import { Alert as AAlert, Segmented as ASegmented } from 'ant-design-vue'
import { defineComponent, h, ref } from 'vue'

/**
 * Segmented Component：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-antd-vue/src/components/StatusTabs.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const SegmentedComponent = ASegmented as any
/**
 * Alert Component：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-antd-vue/src/components/StatusTabs.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const AlertComponent = AAlert as any

/** 三态选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '预览态', value: 'preview' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

/**
 * 格式化值为可读字符串
 * @param val 参数 `val`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '')
    return '—'
  if (typeof val === 'boolean')
    return val ? '是' : '否'
  if (Array.isArray(val))
    return val.length === 0 ? '—' : JSON.stringify(val)
  if (typeof val === 'object')
    return JSON.stringify(val, null, 2)
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
  /**
   * setup：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-antd-vue/src/components/StatusTabs.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象。
   * @param context.slots 当前组件可用插槽集合。
   * @param context.expose 向父级暴露方法的函数。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, context) {
    const { slots, expose } = context
    const mode = ref<FieldPattern>('editable')
    const resultData = ref<Record<string, unknown> | null>(null)
    const errorText = ref('')

    /**
     * 显示提交结果（结构化展示）
     * @param data 参数 `data`用于提供当前函数执行所需的输入信息。
     */
    function showResult(data: Record<string, unknown>): void {
      resultData.value = data
      errorText.value = ''
    }

    /**
     * 显示验证错误列表
     * @param errors 参数 `errors`用于提供当前函数执行所需的输入信息。
     */
    function showErrors(errors: Array<{ path: string, message: string }>): void {
      resultData.value = null
      errorText.value = errors.map(e => `[${e.path}] ${e.message}`).join('\n')
    }

    expose({ mode, showResult, showErrors })

    /**
     * normalize Mode：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/ui-antd-vue/src/components/StatusTabs.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     * @param value 参数 `value`用于提供待处理的值并参与结果计算。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    const /**
           * normalizeMode：执行当前功能逻辑。
           *
           * @param value 参数 value 的输入说明。
           *
           * @returns 返回当前功能的处理结果。
           */
      normalizeMode = (value: unknown): FieldPattern => {
        if (value === 'preview' || value === 'disabled')
          return value
        return 'editable'
      }

    return () => {
      const errorNode = errorText.value
        ? h(AlertComponent, {
            type: 'error',
            message: '验证失败',
            description: h('pre', { style: 'margin: 0; white-space: pre-wrap; font-size: 13px; color: #ff4d4f' }, errorText.value),
            showIcon: true,
            style: 'margin-top: 16px',
          })
        : null

      const resultNode = resultData.value
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
        : null

      return h('div', {
        style: 'height: 100%; min-height: 0; display: flex; flex-direction: column;',
      }, [
        h(SegmentedComponent, {
          'options': MODE_OPTIONS,
          'value': mode.value,
          /**
           * onUpdate:value：执行当前功能逻辑。
           *
           * @param v 参数 v 的输入说明。
           */

          'onUpdate:value': (v: unknown) => { mode.value = normalizeMode(v) },
          /**
           * onChange：执行当前功能逻辑。
           *
           * @param v 参数 v 的输入说明。
           */

          'onChange': (v: unknown) => { mode.value = normalizeMode(v) },
          'style': 'margin-bottom: 16px',
        }),
        h('div', {
          style: 'flex: 1; min-height: 0;',
        }, [
          slots.default?.({ mode: mode.value, showResult, showErrors }),
          errorNode,
          resultNode,
        ]),
      ])
    }
  },
})
