import type { SceneConfig } from '../types'

/** 品牌选项 */
const BRAND_OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: '华为', value: 'huawei' },
  { label: '小米', value: 'xiaomi' },
]

/** 年级选项 */
const GRADE_OPTIONS = [
  { label: '一年级', value: 'grade1' },
  { label: '二年级', value: 'grade2' },
  { label: '三年级', value: 'grade3' },
]

const config: SceneConfig = {
  title: '依赖数据源',
  description: '品牌→型号→配置（三级远程数据源链） / 年级→班级 / 完整走 fetchDataSource 管线',

  initialValues: {
    brand: undefined,
    model: undefined,
    config: undefined,
    grade: undefined,
    classNo: undefined,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      actions: { submit: true, reset: true },
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
        placeholder: '请先选择品牌',
      },
      config: {
        type: 'string',
        title: '配置',
        component: 'Select',
        placeholder: '请先选择型号',
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
        placeholder: '请先选择年级',
      },
    },
  },
}

export default config
