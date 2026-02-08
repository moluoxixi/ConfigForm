import type { SceneConfig } from '../types'

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const config: SceneConfig = {
  title: '卡片分组',
  description: 'Card 多卡片分组 / void 节点布局 / 卡片内验证',

  initialValues: {
    username: '',
    password: '',
    realName: '',
    gender: undefined,
    email: '',
    phone: '',
    address: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      accountCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '🔐 账户信息' },
        properties: {
          username: { type: 'string', title: '用户名', required: true, rules: [{ minLength: 3, message: '至少 3 字符' }] },
          password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 字符' }] },
        },
      },
      personalCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '👤 个人信息' },
        properties: {
          realName: { type: 'string', title: '真实姓名', required: true },
          gender: { type: 'string', title: '性别', component: 'RadioGroup', enum: GENDER_OPTIONS },
        },
      },
      contactCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '📞 联系方式' },
        properties: {
          email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
          phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
          address: { type: 'string', title: '地址', component: 'Textarea' },
        },
      },
    },
  },
}

export default config
