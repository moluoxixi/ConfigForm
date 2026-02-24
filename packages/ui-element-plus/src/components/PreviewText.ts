import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

export const PreviewInput = createPreview('CfPreviewInput')
/**
 * Preview Password：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewPassword = defineComponent({
  name: 'CfPreviewPassword',
  props: { modelValue: { type: String, default: '' } },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    return () => h('span', null, props.modelValue ? '••••••' : '-')
  },
})
/**
 * Preview Textarea：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewTextarea = createPreview('CfPreviewTextarea')
/**
 * Preview Input Number：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewInputNumber = defineComponent({
  name: 'CfPreviewInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    return () => {
      if (props.modelValue == null || props.modelValue === '')
        return h('span', { style: 'color: #c0c4cc' }, '-')
      const value = String(props.modelValue)
      return h('span', null, `${props.prefix || ''}${value}${props.suffix || ''}`)
    }
  },
})
/**
 * Preview Select：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewSelect = createPreview('CfPreviewSelect')
/**
 * Preview Radio Group：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewRadioGroup = createPreview('CfPreviewRadioGroup')
/**
 * Preview Checkbox Group：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewCheckboxGroup = createPreview('CfPreviewCheckboxGroup')
/**
 * Preview Switch：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewSwitch = defineComponent({
  name: 'CfPreviewSwitch',
  props: { modelValue: { type: Boolean, default: false } },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    return () => h('span', null, props.modelValue ? '开' : '关')
  },
})
/**
 * Preview Date Picker：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/PreviewText.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PreviewDatePicker = createPreview('CfPreviewDatePicker')
