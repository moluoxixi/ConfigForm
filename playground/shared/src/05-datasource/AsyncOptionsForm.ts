import type { SceneConfig } from '../types'

/** 类型选项 */
const TYPE_OPTIONS = [
  { label: '水果', value: 'fruit' },
  { label: '蔬菜', value: 'vegetable' },
  { label: '肉类', value: 'meat' },
]

/** 类型→品种 映射（模拟异步数据） */
const ITEM_MAP: Record<string, Array<{ label: string, value: string }>> = {
  fruit: [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '西瓜', value: 'watermelon' },
  ],
  vegetable: [
    { label: '白菜', value: 'cabbage' },
    { label: '胡萝卜', value: 'carrot' },
  ],
  meat: [
    { label: '牛肉', value: 'beef' },
    { label: '猪肉', value: 'pork' },
    { label: '鸡肉', value: 'chicken' },
    { label: '羊肉', value: 'lamb' },
  ],
}

/** 国家选项 */
const COUNTRY_OPTIONS = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
]

/**
 * 场景：异步选项加载
 *
 * 覆盖的 reactions 能力：
 * - dataSource（数组）：联动切换品种选项
 * - state.loading：模拟异步加载状态
 * - componentProps：动态更新 placeholder
 * - debounce：防抖联动（500ms）
 */
const config: SceneConfig = {
  title: '异步选项加载',
  description: '类型→品种联动（reactions 联动 dataSource + loading + 防抖）',

  initialValues: {
    dynamicType: 'fruit',
    dynamicItem: undefined,
    country: 'china',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      actions: { submit: '提交', reset: '重置' },
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
        componentProps: { placeholder: '请选择品种' },
        reactions: [{
          watch: 'dynamicType',
          debounce: 300,
          fulfill: {
            /** 模拟异步加载：先设 loading，延迟后设数据源 */
            run: (field, ctx) => {
              const type = ctx.values.dynamicType as string | undefined
              field.setValue(undefined as never)

              if (type && ITEM_MAP[type]) {
                field.loading = true
                field.setComponentProps({ placeholder: '加载中...' })
                /* 模拟 300ms 网络延迟 */
                setTimeout(() => {
                  field.setDataSource(ITEM_MAP[type])
                  field.loading = false
                  field.setComponentProps({ placeholder: '请选择品种' })
                }, 300)
              }
              else {
                field.setDataSource([])
                field.setComponentProps({ placeholder: '请先选择类型' })
              }
            },
          },
        }],
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
        componentProps: { placeholder: '请输入' },
      },
    },
  },
}

export default config
