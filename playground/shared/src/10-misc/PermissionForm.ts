import type { SceneConfig } from '../types'

/**
 * 场景：字段级权限控制
 *
 * 演示基于角色的字段可见性 + 读写权限矩阵能力。
 * 通过权限矩阵动态设置字段实例的 visible / pattern 属性。
 */

/** 角色选项 */
const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '经理', value: 'manager' },
  { label: '员工', value: 'staff' },
  { label: '访客', value: 'guest' },
]

/** 权限矩阵：字段名 → 角色 → 权限 */
const PERM_MATRIX: Record<string, Record<string, string>> = {
  name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' },
  email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' },
  salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' },
  level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' },
}

const config: SceneConfig & { roleOptions: typeof ROLE_OPTIONS; permMatrix: typeof PERM_MATRIX } = {
  title: '字段级权限控制',
  description: '基于角色的字段可见性 + 读写权限 — ConfigForm + Schema 实现',

  initialValues: {
    name: '张三',
    email: 'zhangsan@company.com',
    salary: 25000,
    department: '技术部',
    level: 'P7',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      name: { type: 'string', title: '姓名' },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      salary: { type: 'number', title: '薪资', componentProps: { style: 'width: 100%' } },
      department: { type: 'string', title: '部门' },
      level: { type: 'string', title: '职级' },
      remark: { type: 'string', title: '备注', component: 'Textarea' },
    },
  },

  fields: [
    { name: 'name', label: '姓名', component: 'Input' },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'salary', label: '薪资', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
    { name: 'department', label: '部门', component: 'Input' },
    { name: 'level', label: '职级', component: 'Input' },
    { name: 'remark', label: '备注', component: 'Textarea' },
  ],

  /** 角色选项（供实现侧使用） */
  roleOptions: ROLE_OPTIONS,

  /** 权限矩阵（供实现侧使用） */
  permMatrix: PERM_MATRIX,
}

export default config
