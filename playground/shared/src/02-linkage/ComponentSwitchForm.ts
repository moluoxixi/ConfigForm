import type { SceneConfig } from '../types'

/**
 * 场景：组件切换联动
 *
 * 演示 reactions 动态切换字段的渲染组件：
 * - 输入方式切换：文本输入 / 下拉选择 / 单选组
 * - 根据数据类型切换编辑器
 */

const DATA_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '布尔', value: 'boolean' },
]

const INPUT_MODE_OPTIONS = [
  { label: '手动输入', value: 'input' },
  { label: '下拉选择', value: 'select' },
  { label: '单选', value: 'radio' },
]

const PRESET_OPTIONS = [
  { label: '选项 A', value: 'optionA' },
  { label: '选项 B', value: 'optionB' },
  { label: '选项 C', value: 'optionC' },
]

const config: SceneConfig = {
  title: '组件切换联动',
  description: 'reactions.fulfill.component — 动态切换字段的渲染组件',

  initialValues: {
    inputMode: 'input',
    fieldValue: '',
    dataType: 'text',
    configValue: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      inputMode: {
        type: 'string',
        title: '输入方式',
        component: 'RadioGroup',
        enum: INPUT_MODE_OPTIONS,
      },
      fieldValue: {
        type: 'string',
        title: '字段值',
        description: '切换「输入方式」观察组件变化',
        enum: PRESET_OPTIONS,
        componentProps: { placeholder: '请输入内容' },
        reactions: [
          {
            watch: 'inputMode',
            when: '{{$values.inputMode === "input"}}',
            fulfill: { component: 'Input', componentProps: { placeholder: '手动输入模式' } },
          },
          {
            watch: 'inputMode',
            when: '{{$values.inputMode === "select"}}',
            fulfill: { component: 'Select', componentProps: { placeholder: '下拉选择模式' } },
          },
          {
            watch: 'inputMode',
            when: '{{$values.inputMode === "radio"}}',
            fulfill: { component: 'RadioGroup' },
          },
        ],
      },
      dataType: {
        type: 'string',
        title: '数据类型',
        component: 'RadioGroup',
        enum: DATA_TYPE_OPTIONS,
      },
      configValue: {
        type: 'string',
        title: '配置值',
        description: '切换「数据类型」观察组件变化',
        componentProps: { placeholder: '请输入' },
        reactions: [
          {
            watch: 'dataType',
            when: '{{$values.dataType === "text"}}',
            fulfill: { component: 'Input', componentProps: { placeholder: '输入文本' } },
          },
          {
            watch: 'dataType',
            when: '{{$values.dataType === "number"}}',
            fulfill: { component: 'InputNumber', componentProps: { style: 'width: 100%' } },
          },
          {
            watch: 'dataType',
            when: '{{$values.dataType === "date"}}',
            fulfill: { component: 'DatePicker', componentProps: { style: 'width: 100%' } },
          },
          {
            watch: 'dataType',
            when: '{{$values.dataType === "boolean"}}',
            fulfill: { component: 'Switch' },
          },
        ],
      },
    },
  },
}

export default config
