/**
 * 阅读态纯文本展示组件集（readPretty）
 *
 * 参考 Formily PreviewText 设计，每个组件对应一个编辑组件的阅读态替代。
 * 由 ReactiveField 在 isPreview 时自动替换渲染，UI 组件无需关心预览态。
 */
import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Tag as ATag } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 空值占位符 */
const EMPTY = '—'

/** 文本输入阅读态 */
export const PreviewInput = defineComponent({
  name: 'CfPreviewInput',
  props: { modelValue: { type: [String, Number], default: '' } },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:19`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => h('span', null, props.modelValue ? String(props.modelValue) : EMPTY)
  },
})

/** 密码阅读态 */
export const PreviewPassword = defineComponent({
  name: 'CfPreviewPassword',
  props: { modelValue: { type: String, default: '' } },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:28`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => h('span', null, props.modelValue ? '••••••••' : EMPTY)
  },
})

/** 多行文本阅读态 */
export const PreviewTextarea = defineComponent({
  name: 'CfPreviewTextarea',
  props: { modelValue: { type: String, default: '' } },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:37`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => h('span', { style: 'white-space: pre-wrap' }, props.modelValue || EMPTY)
  },
})

/** 数字输入阅读态 */
export const PreviewInputNumber = defineComponent({
  name: 'CfPreviewInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: undefined },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:51`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => {
      if (props.modelValue == null)
        return h('span', null, EMPTY)
      const value = String(props.modelValue)
      return h('span', null, `${props.prefix || ''}${value}${props.suffix || ''}`)
    }
  },
})

/** 下拉选择阅读态 */
export const PreviewSelect = defineComponent({
  name: 'CfPreviewSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:66`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:105`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
  },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:68`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => {
      const val = props.modelValue
      if (val == null || val === '')
        return h('span', null, EMPTY)
      if (Array.isArray(val)) {
        if (val.length === 0)
          return h('span', null, EMPTY)
        return h('span', null, val.map((v, i) => {
          const label = props.dataSource.find(item => item.value === v)?.label ?? String(v)
          return [i > 0 ? ' ' : null, h(ATag, { key: i }, () => label)]
        }))
      }
      const selectedLabel = props.dataSource.find(item => item.value === val)?.label
      return h('span', null, selectedLabel || (val ? String(val) : EMPTY))
    }
  },
})

/** 单选组阅读态 */
export const PreviewRadioGroup = defineComponent({
  name: 'CfPreviewRadioGroup',
  props: {
    modelValue: { type: [String, Number], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:92`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:146`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
  },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:94`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => {
      const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
      return h('span', null, selectedLabel || (props.modelValue ? String(props.modelValue) : EMPTY))
    }
  },
})

/** 多选组阅读态 */
export const PreviewCheckboxGroup = defineComponent({
  name: 'CfPreviewCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, /**
                                                       * default：执行当前位置的功能逻辑。
                                                       * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:106`。
                                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                       * @returns 返回当前分支执行后的处理结果。
                                                       */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:175`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, /**
                                                              * default：执行当前位置的功能逻辑。
                                                              * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:107`。
                                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                              * @returns 返回当前分支执行后的处理结果。
                                                              */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:183`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
  },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:109`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => {
      const labels = (props.modelValue ?? [])
        .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
        .join('、')
      return h('span', null, labels || EMPTY)
    }
  },
})

/** 开关阅读态 */
export const PreviewSwitch = defineComponent({
  name: 'CfPreviewSwitch',
  props: { modelValue: { type: Boolean, default: false } },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:123`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => h('span', null, props.modelValue ? '是' : '否')
  },
})

/** 日期选择阅读态 */
export const PreviewDatePicker = defineComponent({
  name: 'CfPreviewDatePicker',
  props: { modelValue: { type: String, default: '' } },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/PreviewText.ts:132`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    return () => h('span', null, props.modelValue || EMPTY)
  },
})
