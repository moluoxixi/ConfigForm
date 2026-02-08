import type { ISchema } from '@moluoxixi/schema'
import type { SceneConfig } from '../types'

/**
 * 场景 2：表单布局
 *
 * 覆盖：水平 / 垂直 / 行内 / 栅格布局、labelPosition / labelWidth
 */

/** 布局选项 */
export const LAYOUT_OPTIONS = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
  { label: '行内', value: 'inline' },
  { label: '栅格两列', value: 'grid-2col' },
]

/** 布局类型 */
export type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col'

/** 部门选项 */
const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
]

/** 字段 properties（布局切换时共用） */
const PROPERTIES: ISchema['properties'] = {
  name: { type: 'string', title: '姓名', required: true, componentProps: { placeholder: '请输入姓名' } },
  email: { type: 'string', title: '邮箱', required: true, componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] },
  phone: { type: 'string', title: '手机号', componentProps: { placeholder: '请输入手机号' } },
  department: { type: 'string', title: '部门', component: 'Select', componentProps: { placeholder: '请选择' }, enum: DEPARTMENT_OPTIONS },
  role: { type: 'string', title: '职位', componentProps: { placeholder: '请输入职位' } },
  joinDate: { type: 'string', title: '入职日期', component: 'DatePicker' },
}

/**
 * 根据布局类型生成 Schema
 *
 * LayoutForm 是特殊场景：需要动态切换布局。
 * Config 模式通过 createSchema 动态生成；Field 模式通过外层容器样式控制。
 */
export function createSchema(layoutType: LayoutType): ISchema {
  const s: ISchema = {
    type: 'object',
    decoratorProps: { labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: { ...PROPERTIES },
  }
  switch (layoutType) {
    case 'horizontal':
      s.decoratorProps!.labelPosition = 'right'
      s.decoratorProps!.direction = 'vertical'
      break
    case 'vertical':
      s.decoratorProps!.labelPosition = 'top'
      s.decoratorProps!.direction = 'vertical'
      break
    case 'inline':
      s.decoratorProps!.labelPosition = 'right'
      s.decoratorProps!.direction = 'inline'
      break
    case 'grid-2col':
      s.decoratorProps!.labelPosition = 'right'
      s.layout = { type: 'grid', columns: 2, gutter: 24 }
      break
  }
  return s
}

const config: SceneConfig = {
  title: '表单布局',
  description: '水平 / 垂直 / 行内 / 栅格布局',

  initialValues: { name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' },

  /** 默认水平布局 schema */
  schema: createSchema('horizontal'),
}

export default config
