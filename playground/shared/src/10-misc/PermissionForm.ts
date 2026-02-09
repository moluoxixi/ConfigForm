import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：字段级权限控制
 *
 * 演示 lowerCodePlugin 的 acl 能力：
 * - 基于角色的字段权限（full / edit / view / hidden / none）
 * - 通配符路径匹配（如 'address.*'）
 * - 多角色权限合并（取最高权限）
 * - 动态切换角色
 */

const config: SceneConfig = {
  title: '字段级权限控制',
  description: 'lowerCodePlugin.acl — 基于角色的字段可见性 + 读写权限',

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

  plugins: [
    lowerCodePlugin({
      acl: {
        defaultPermission: 'view',
        roles: [
          { role: 'admin', rules: [{ pattern: '*', permission: 'full' }] },
          { role: 'manager', rules: [
            { pattern: 'name', permission: 'edit' },
            { pattern: 'email', permission: 'edit' },
            { pattern: 'salary', permission: 'view' },
            { pattern: 'department', permission: 'edit' },
            { pattern: 'level', permission: 'view' },
            { pattern: 'remark', permission: 'edit' },
          ] },
          { role: 'staff', rules: [
            { pattern: 'name', permission: 'edit' },
            { pattern: 'email', permission: 'view' },
            { pattern: 'salary', permission: 'hidden' },
            { pattern: 'level', permission: 'hidden' },
            { pattern: 'remark', permission: 'edit' },
          ] },
          { role: 'guest', rules: [
            { pattern: 'salary', permission: 'none' },
            { pattern: 'level', permission: 'none' },
            { pattern: 'remark', permission: 'none' },
          ] },
        ],
      },
      history: false,
      dirtyChecker: false,
      submitRetry: false,
      subForm: false,
    }),
  ],
}

export default config
