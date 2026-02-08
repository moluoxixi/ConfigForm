import type { SceneConfig } from '../types'

/** 组织树数据 */
const TREE_DATA = [
  {
    title: '总公司',
    value: 'root',
    children: [
      {
        title: '技术中心',
        value: 'tech',
        children: [
          { title: '前端组', value: 'frontend' },
          { title: '后端组', value: 'backend' },
        ],
      },
      {
        title: '产品中心',
        value: 'product',
        children: [
          { title: '产品设计', value: 'pd' },
          { title: '用户研究', value: 'ux' },
        ],
      },
    ],
  },
]

const config: SceneConfig = {
  title: '树形选择',
  description: 'antd TreeSelect / 单选+多选 / 组织树结构',

  initialValues: {
    memberName: '',
    department: undefined,
    accessDepts: [] as string[],
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      memberName: { type: 'string', title: '成员姓名', required: true, componentProps: { placeholder: '请输入姓名', style: 'width: 300px' } },
      department: { type: 'string', title: '所属部门', required: true, component: 'TreeSelectPicker', componentProps: { treeData: TREE_DATA, placeholder: '请选择部门', style: 'width: 300px' } },
      accessDepts: { type: 'string', title: '可访问部门', component: 'TreeSelectPicker', componentProps: { treeData: TREE_DATA, treeCheckable: true, placeholder: '多选可访问部门', style: 'width: 100%' } },
    },
  },

  fields: [
    { name: 'memberName', label: '成员姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名', style: 'width: 300px' } },
    { name: 'department', label: '所属部门', required: true, component: 'TreeSelectPicker', componentProps: { treeData: TREE_DATA, placeholder: '请选择部门', style: 'width: 300px' } },
    { name: 'accessDepts', label: '可访问部门', component: 'TreeSelectPicker', componentProps: { treeData: TREE_DATA, treeCheckable: true, placeholder: '多选可访问部门', style: 'width: 100%' } },
  ],
}

export default config
