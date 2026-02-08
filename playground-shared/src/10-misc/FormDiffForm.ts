import type { SceneConfig } from '../types'

/**
 * 场景：表单比对
 *
 * 演示变更高亮 / 原始值 vs 当前值 / 变更摘要能力。
 * 通过 form.onValuesChange 监听值变化，与原始值进行 diff 对比。
 */

const config: SceneConfig = {
  title: '表单比对',
  description: '变更高亮 / 原始值 vs 当前值 — ConfigForm + Schema 实现',

  initialValues: {
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138000',
    salary: 25000,
    department: '技术部',
    bio: '5 年前端经验',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      name: { type: 'string', title: '姓名' },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', title: '电话', rules: [{ format: 'phone', message: '无效手机号' }] },
      salary: { type: 'number', title: '薪资', componentProps: { style: 'width: 100%' } },
      department: { type: 'string', title: '部门' },
      bio: { type: 'string', title: '简介', component: 'Textarea', componentProps: { rows: 2 } },
    },
  },

  fields: [
    { name: 'name', label: '姓名', component: 'Input' },
    { name: 'email', label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'phone', label: '电话', component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'salary', label: '薪资', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
    { name: 'department', label: '部门', component: 'Input' },
    { name: 'bio', label: '简介', component: 'Textarea', componentProps: { rows: 2 } },
  ],
}

export default config
