import type { SceneConfig } from '../types'

/**
 * 场景 3：必填与格式验证
 *
 * 覆盖：required / email / phone / URL / pattern / min-max / minLength / maxLength
 */

/** 邮编验证规则 */
const zipCodeRules = [{ pattern: /^\d{6}$/, message: '6 位数字' }]
/** 身份证验证规则 */
const idCardRules = [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]
/** 密码验证规则 */
const passwordRules = [
  { minLength: 8, maxLength: 32, message: '8-32 字符' },
  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需含大小写和数字' },
]

const config: SceneConfig = {
  title: '必填与格式验证',
  description: 'required / email / phone / URL / pattern / min-max',

  initialValues: {
    username: '', email: '', phone: '', website: '', nickname: '',
    age: undefined, zipCode: '', idCard: '', password: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '140px' },
    properties: {
      username: { type: 'string', title: '用户名（必填）', required: true, componentProps: { placeholder: '请输入' }, rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }] },
      email: { type: 'string', title: '邮箱', required: true, componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', title: '手机号', required: true, componentProps: { placeholder: '11 位手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] },
      website: { type: 'string', title: '个人网站', componentProps: { placeholder: 'https://...' }, rules: [{ format: 'url', message: '无效 URL' }] },
      nickname: { type: 'string', title: '昵称', componentProps: { placeholder: '2-10 字符' }, rules: [{ minLength: 2, message: '至少 2 字符' }, { maxLength: 10, message: '最多 10 字符' }] },
      age: { type: 'number', title: '年龄', required: true, component: 'InputNumber', rules: [{ min: 1, max: 150, message: '1-150' }] },
      zipCode: { type: 'string', title: '邮编', componentProps: { placeholder: '6 位数字' }, rules: zipCodeRules },
      idCard: { type: 'string', title: '身份证号', componentProps: { placeholder: '18 位' }, rules: idCardRules },
      password: { type: 'string', title: '密码', required: true, component: 'Password', componentProps: { placeholder: '8-32 位' }, rules: passwordRules },
    },
  },

  fields: [
    { name: 'username', label: '用户名（必填）', required: true, component: 'Input', componentProps: { placeholder: '请输入' }, rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }] },
    { name: 'email', label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'phone', label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '11 位手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'website', label: '个人网站', component: 'Input', componentProps: { placeholder: 'https://...' }, rules: [{ format: 'url', message: '无效 URL' }] },
    { name: 'nickname', label: '昵称', component: 'Input', componentProps: { placeholder: '2-10 字符' }, rules: [{ minLength: 2, message: '至少 2 字符' }, { maxLength: 10, message: '最多 10 字符' }] },
    { name: 'age', label: '年龄', required: true, component: 'InputNumber', rules: [{ min: 1, max: 150, message: '1-150' }] },
    { name: 'zipCode', label: '邮编', component: 'Input', componentProps: { placeholder: '6 位数字' }, rules: zipCodeRules },
    { name: 'idCard', label: '身份证号', component: 'Input', componentProps: { placeholder: '18 位' }, rules: idCardRules },
    { name: 'password', label: '密码', required: true, component: 'Password', componentProps: { placeholder: '8-32 位' }, rules: passwordRules },
  ],
}

export default config
