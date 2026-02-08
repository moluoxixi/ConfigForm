import type { SceneConfig } from '../types'

/**
 * 场景 1：基础表单
 *
 * 覆盖：Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
 */

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

/** 婚姻选项 */
const MARITAL_OPTIONS = [
  { label: '未婚', value: 'single' },
  { label: '已婚', value: 'married' },
]

/** 爱好选项 */
const HOBBY_OPTIONS = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '编程', value: 'coding' },
]

const config: SceneConfig = {
  title: '基础表单',
  description: 'Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker',

  initialValues: {
    username: '', password: '', email: '', phone: '',
    age: 18, gender: undefined, marital: 'single',
    hobbies: [], notification: true, birthday: '', bio: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      username: { type: 'string', title: '用户名', required: true, rules: [{ minLength: 3, maxLength: 20, message: '3-20 个字符' }] },
      password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 个字符' }] },
      email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '邮箱格式不正确' }] },
      phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '手机号格式不正确' }] },
      age: { type: 'number', title: '年龄', required: true, default: 18, componentProps: { min: 0, max: 150 } },
      gender: { type: 'string', title: '性别', enum: GENDER_OPTIONS },
      marital: { type: 'string', title: '婚姻状况', component: 'RadioGroup', default: 'single', enum: MARITAL_OPTIONS },
      hobbies: { type: 'array', title: '爱好', component: 'CheckboxGroup', default: [], enum: HOBBY_OPTIONS },
      notification: { type: 'boolean', title: '开启通知', default: true },
      birthday: { type: 'date', title: '生日' },
      bio: { type: 'string', title: '个人简介', component: 'Textarea', rules: [{ maxLength: 200, message: '最多 200 字' }] },
    },
  },
}

export default config
