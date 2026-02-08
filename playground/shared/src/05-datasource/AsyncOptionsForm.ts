import type { SceneConfig } from '../types'

/** 类型选项 */
const TYPE_OPTIONS = [
  { label: '水果', value: 'fruit' },
  { label: '蔬菜', value: 'vegetable' },
  { label: '肉类', value: 'meat' },
]

/** 国家选项 */
const COUNTRY_OPTIONS = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
]

const config: SceneConfig = {
  title: '异步选项加载',
  description: '远程 dataSource / reactions 异步加载 / loading 状态',

  initialValues: {
    dynamicType: 'fruit',
    dynamicItem: undefined,
    country: 'china',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      actions: { submit: true, reset: true },
      labelPosition: 'right',
      labelWidth: '140px',
    },
    properties: {
      dynamicType: {
        type: 'string',
        title: '类型',
        default: 'fruit',
        enum: TYPE_OPTIONS,
      },
      dynamicItem: {
        type: 'string',
        title: '品种（异步）',
        component: 'Select',
        placeholder: '加载中...',
      },
      country: {
        type: 'string',
        title: '国家',
        default: 'china',
        enum: COUNTRY_OPTIONS,
      },
      remark: {
        type: 'string',
        title: '备注',
        component: 'Textarea',
        placeholder: '请输入',
      },
    },
  },

  fields: [
    { name: 'dynamicType', label: '类型', component: 'Select', dataSource: TYPE_OPTIONS, componentProps: { placeholder: '请选择类型' } },
    { name: 'dynamicItem', label: '品种（异步）', component: 'Select', componentProps: { placeholder: '加载中...' } },
    { name: 'country', label: '国家', component: 'Select', dataSource: COUNTRY_OPTIONS, componentProps: { placeholder: '请选择国家' } },
    { name: 'remark', label: '备注', component: 'Textarea', componentProps: { placeholder: '请输入' } },
  ],
}

export default config
