import type { SceneConfig } from '../types'

/** 品牌选项 */
const BRAND_OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: '华为', value: 'huawei' },
  { label: '小米', value: 'xiaomi' },
]

/** 品牌→型号 映射（模拟远程数据） */
const MODEL_MAP: Record<string, Array<{ label: string, value: string }>> = {
  apple: [
    { label: 'iPhone 15', value: 'iphone15' },
    { label: 'iPhone 15 Pro', value: 'iphone15pro' },
    { label: 'MacBook Pro', value: 'macbookpro' },
  ],
  huawei: [
    { label: 'Mate 60', value: 'mate60' },
    { label: 'P60', value: 'p60' },
    { label: 'MateBook X', value: 'matebookx' },
  ],
  xiaomi: [
    { label: '小米 14', value: 'mi14' },
    { label: 'Redmi K70', value: 'redmik70' },
  ],
}

/** 年级选项 */
const GRADE_OPTIONS = [
  { label: '一年级', value: 'grade1' },
  { label: '二年级', value: 'grade2' },
  { label: '三年级', value: 'grade3' },
]

/** 年级→班级 映射 */
const CLASS_MAP: Record<string, Array<{ label: string, value: string }>> = {
  grade1: [{ label: '1 班', value: 'c1' }, { label: '2 班', value: 'c2' }],
  grade2: [{ label: '1 班', value: 'c1' }, { label: '2 班', value: 'c2' }, { label: '3 班', value: 'c3' }],
  grade3: [{ label: '1 班', value: 'c1' }],
}

/**
 * 场景：依赖数据源
 *
 * 覆盖的 reactions 能力：
 * - dataSource（数组）：联动切换下级选项
 * - state.disabled：无上级选择时禁用下级
 * - value：上级变化时清空下级值
 * - run：自定义执行（日志输出）
 */
const config: SceneConfig = {
  title: '依赖数据源',
  description: '品牌→型号 级联（reactions 联动 dataSource + disabled + 清空下级）',

  initialValues: {
    brand: undefined,
    model: undefined,
    grade: undefined,
    classNo: undefined,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      actions: { submit: '提交', reset: '重置' },
      labelPosition: 'right',
      labelWidth: '140px',
    },
    properties: {
      brand: {
        type: 'string',
        title: '品牌',
        required: true,
        enum: BRAND_OPTIONS,
      },
      model: {
        type: 'string',
        title: '型号',
        required: true,
        component: 'Select',
        disabled: true,
        componentProps: { placeholder: '请先选择品牌' },
        reactions: [{
          watch: 'brand',
          fulfill: {
            /** 根据品牌动态设置型号选项 + 启用/禁用 + 清空旧值 */
            run: (field, ctx) => {
              const brand = ctx.values.brand as string | undefined
              if (brand && MODEL_MAP[brand]) {
                field.setDataSource(MODEL_MAP[brand])
                field.disabled = false
                field.setComponentProps({ placeholder: '请选择型号' })
              }
              else {
                field.setDataSource([])
                field.disabled = true
                field.setComponentProps({ placeholder: '请先选择品牌' })
              }
              field.setValue(undefined as never)
            },
          },
        }],
      },
      grade: {
        type: 'string',
        title: '年级',
        required: true,
        enum: GRADE_OPTIONS,
      },
      classNo: {
        type: 'string',
        title: '班级',
        required: true,
        component: 'Select',
        disabled: true,
        componentProps: { placeholder: '请先选择年级' },
        reactions: [{
          watch: 'grade',
          fulfill: {
            run: (field, ctx) => {
              const grade = ctx.values.grade as string | undefined
              if (grade && CLASS_MAP[grade]) {
                field.setDataSource(CLASS_MAP[grade])
                field.disabled = false
                field.setComponentProps({ placeholder: '请选择班级' })
              }
              else {
                field.setDataSource([])
                field.disabled = true
                field.setComponentProps({ placeholder: '请先选择年级' })
              }
              field.setValue(undefined as never)
            },
          },
        }],
      },
    },
  },
}

export default config
