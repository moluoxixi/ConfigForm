import type { ValidationRule } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：自定义验证规则
 *
 * 覆盖：正则 / 自定义函数 / 多规则 / 警告级 / 条件规则
 */

/** 弱密码黑名单 */
const WEAK_PWD = ['12345678', 'password', 'qwerty123']

/** 证件类型选项 */
const ID_TYPE_OPTIONS = [
  { label: '身份证', value: 'idcard' },
  { label: '护照', value: 'passport' },
  { label: '军官证', value: 'military' },
]

/** 车牌号规则：汉字 + 字母 + 5 位字母数字 */
const licensePlateRules: ValidationRule[] = [{ pattern: /^[\u4E00-\u9FA5][A-Z][A-Z0-9]{5}$/, message: '无效车牌号' }]

/** 手机号规则：中国大陆 11 位 */
const phoneRules: ValidationRule[] = [{
  validator: (v: unknown): string | undefined => {
    if (!v)
      return undefined
    if (!/^1[3-9]\d{9}$/.test(String(v)))
      return '无效大陆手机号'
    return undefined
  },
}]

/** 密码规则：长度 + 多种字符类型 + 弱密码检测 */
const passwordRules: ValidationRule[] = [
  { stopOnFirstFailure: true, minLength: 8, maxLength: 32, message: '8-32 字符' },
  { pattern: /[a-z]/, message: '需含小写' },
  { pattern: /[A-Z]/, message: '需含大写' },
  { pattern: /\d/, message: '需含数字' },
  { validator: (v: unknown): string | undefined => WEAK_PWD.includes(String(v).toLowerCase()) ? '密码过于简单' : undefined },
]

/** 年龄规则：范围校验 + 警告级提示 */
const ageRules: ValidationRule[] = [
  { min: 0, max: 150, message: '0-150' },
  {
    level: 'warning',
    validator: (v: unknown): string | undefined => {
      const a = Number(v)
      if (a > 0 && a < 18)
        return '未成年部分功能受限'
      if (a > 60)
        return '建议开启大字模式'
      return undefined
    },
  },
]

/** IP 地址规则：IPv4 格式验证 */
const ipAddressRules: ValidationRule[] = [{
  validator: (v: unknown): string | undefined => {
    if (!v)
      return undefined
    const parts = String(v).split('.')
    if (parts.length !== 4)
      return 'IP 格式错误'
    for (const p of parts) {
      const n = Number(p)
      if (Number.isNaN(n) || n < 0 || n > 255 || String(n) !== p)
        return '各段 0-255 整数'
    }
    return undefined
  },
}]

const config: SceneConfig = {
  title: '自定义验证规则',
  description: '正则 / 自定义函数 / 多规则 / 警告级 / 条件规则',

  initialValues: {
    licensePlate: '',
    phone: '',
    password: '',
    age: undefined,
    idType: 'idcard',
    idNumber: '',
    ipAddress: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '150px' },
    properties: {
      licensePlate: { type: 'string', title: '车牌号', componentProps: { placeholder: '京A12345' }, rules: licensePlateRules },
      phone: { type: 'string', title: '手机号', required: true, componentProps: { placeholder: '中国大陆手机号' }, rules: phoneRules },
      password: { type: 'string', title: '密码', required: true, component: 'Password', rules: passwordRules },
      age: { type: 'number', title: '年龄', required: true, rules: ageRules },
      idType: { type: 'string', title: '证件类型', required: true, default: 'idcard', enum: ID_TYPE_OPTIONS },
      idNumber: {
        type: 'string',
        title: '证件号码',
        required: true,
        reactions: [{ watch: 'idType', fulfill: { run: (f: any, ctx: any) => {
          const t = ctx.values.idType as string
          f.setValue('')
          f.errors = []
          if (t === 'idcard') {
            f.rules = [{ required: true, message: '请输入' }, { pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]
            f.setComponentProps({ placeholder: '18 位身份证' })
          }
          else if (t === 'passport') {
            f.rules = [{ required: true, message: '请输入' }, { pattern: /^[A-Z]\d{8}$/, message: '格式：E12345678' }]
            f.setComponentProps({ placeholder: 'E12345678' })
          }
          else {
            f.rules = [{ required: true, message: '请输入' }, { minLength: 6, maxLength: 12, message: '6-12 位' }]
            f.setComponentProps({ placeholder: '军官证号' })
          }
        } } }],
      },
      ipAddress: { type: 'string', title: 'IP 地址', componentProps: { placeholder: '192.168.1.1' }, rules: ipAddressRules },
    },
  },
}

export default config
