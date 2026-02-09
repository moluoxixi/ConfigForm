import type { SceneConfig } from '../types'

/** 城市选项 */
const CITY_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
]

const config: SceneConfig = {
  title: '动态 Schema',
  description: 'mergeSchema 合并 / 场景切换 / 热更新',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    idCard: '',
    city: undefined,
    companyName: '',
    creditCode: '',
    school: '',
    studentId: '',
    major: '',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      name: { type: 'string', title: '姓名', required: true },
      phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      remark: { type: 'string', title: '备注', component: 'Textarea' },
    },
  },
}

export default config
