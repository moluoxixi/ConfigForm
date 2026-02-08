import type { SceneConfig } from '../types'

/** 模拟用户数据（50 条） */
const USER_OPTIONS = Array.from({ length: 50 }, (_, i) => ({
  label: `用户${String(i + 1).padStart(4, '0')}（${['技术', '产品', '设计', '运营'][i % 4]}）`,
  value: `user-${i + 1}`,
}))

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
  { label: '运营部', value: 'operation' },
]

const config: SceneConfig = {
  title: '分页搜索数据源',
  description: '远程数据源配置 / 搜索防抖',

  initialValues: {
    userId: undefined,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      userId: {
        type: 'string',
        title: '选择用户',
        required: true,
        component: 'Select',
        dataSource: USER_OPTIONS,
        componentProps: {
          showSearch: true,
          placeholder: '输入关键词搜索用户',
          style: 'width: 400px',
        },
      },
      department: {
        type: 'string',
        title: '部门',
        enum: DEPARTMENT_OPTIONS,
        componentProps: { placeholder: '选择部门' },
      },
    },
  },

  fields: [
    {
      name: 'userId',
      label: '选择用户',
      required: true,
      component: 'Select',
      componentProps: { showSearch: true, filterOption: false, style: 'width: 400px', placeholder: '输入关键词搜索用户' },
    },
  ],
}

export default config
