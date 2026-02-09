import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：表单比对
 *
 * 演示 lowerCodePlugin 的 dirtyChecker 能力：
 * - 深度对比 values 与 initialValues
 * - 字段级 Diff（added / removed / changed）
 * - 对比视图（initial vs current）
 * - 脏字段数量统计
 */

const config: SceneConfig = {
  title: '表单比对',
  description: 'lowerCodePlugin.dirtyChecker — 变更高亮 / 原始值 vs 当前值',

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

  plugins: [
    lowerCodePlugin({
      history: false,
      acl: false,
      submitRetry: false,
      subForm: false,
    }),
  ],
}

export default config
