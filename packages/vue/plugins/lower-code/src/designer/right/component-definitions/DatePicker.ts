import type { LowCodeDesignerComponentDefinition } from '../../types'

/**
 * Date Picker Definition：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/DatePicker.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DatePickerDefinition: LowCodeDesignerComponentDefinition = {
  label: '日期选择',
  description: '用于日期输入，适合生效时间、截止时间、排期等日期类字段。',
  fieldType: 'date',
  defaultProps: {
    placeholder: '请选择日期',
    format: 'YYYY-MM-DD',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择日期',
    },
    {
      key: 'size',
      label: '尺寸',
      editor: 'select',
      options: [
        { label: '默认', value: '' },
        { label: '小', value: 'small' },
        { label: '中', value: 'middle' },
        { label: '大', value: 'large' },
      ],
    },
    {
      key: 'format',
      label: '日期格式',
      editor: 'text',
      defaultValue: 'YYYY-MM-DD',
    },
    {
      key: 'showTime',
      label: '显示时间',
      editor: 'switch',
    },
  ],
}
