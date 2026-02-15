import type { SceneConfig } from '../types'

/**
 * 场景：Schema 片段复用
 *
 * 演示通过 $ref + definitions 复用 Schema 片段（JSON Schema 标准方式）：
 * - 定义 contactInfo / addressInfo 两个可复用片段
 * - 通过 $ref 引用复用，不同位置可覆盖 title / component / properties
 * - 紧急联系人在 contactInfo 基础上追加 addressInfo 片段
 *
 * 这是 JSON Schema 标准的复用方式，$ref 在编译时自动解析。
 */

const PROVINCE_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
]

const config: SceneConfig = {
  title: 'Schema 片段复用',
  description: '$ref + definitions — 联系人信息和地址信息片段复用',

  initialValues: {
    name: '',
    myContact: {
      phone: '',
      email: '',
    },
    myAddress: {
      province: undefined,
      city: '',
      address: '',
    },
    emergencyContact: {
      phone: '',
      email: '',
      address: {
        province: undefined,
        city: '',
        address: '',
      },
    },
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    definitions: {
      contactInfo: {
        type: 'object',
        properties: {
          phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
          email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
        },
      },
      addressInfo: {
        type: 'object',
        properties: {
          province: { type: 'string', title: '省份', enum: PROVINCE_OPTIONS },
          city: { type: 'string', title: '城市' },
          address: { type: 'string', title: '详细地址', component: 'Textarea' },
        },
      },
    },
    properties: {
      name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      myContact: {
        $ref: '#/definitions/contactInfo',
        type: 'object',
        title: '我的联系方式（复用 contactInfo）',
        decorator: '',
        component: 'LayoutCard',
        componentProps: { title: '我的联系方式（复用 contactInfo）' },
      },
      myAddress: {
        $ref: '#/definitions/addressInfo',
        type: 'object',
        title: '我的地址（复用 addressInfo）',
        decorator: '',
        component: 'LayoutCard',
        componentProps: { title: '我的地址（复用 addressInfo）' },
      },
      emergencyContact: {
        $ref: '#/definitions/contactInfo',
        type: 'object',
        title: '紧急联系人（同样的字段结构）',
        decorator: '',
        component: 'LayoutCard',
        componentProps: { title: '紧急联系人（同样的字段结构）' },
        properties: {
          address: {
            $ref: '#/definitions/addressInfo',
            type: 'object',
            decorator: '',
            component: 'LayoutCard',
            componentProps: { title: '紧急联系地址' },
          },
        },
      },
      remark: { type: 'string', title: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
    },
  },
}

export default config
