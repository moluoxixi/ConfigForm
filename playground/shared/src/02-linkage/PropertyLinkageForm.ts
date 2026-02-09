import type { SceneConfig } from '../types'

/**
 * 场景：属性联动
 *
 * 覆盖：动态 disabled / required / placeholder / componentProps
 * 使用 {{表达式}} + 多条件 reactions 替代复杂 run 函数。
 */

/** 联系方式类型选项 */
const CONTACT_TYPE_OPTIONS = [
  { label: '手机', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '微信', value: 'wechat' },
]

/** 产品类型选项 */
const PRODUCT_TYPE_OPTIONS = [
  { label: '标准品', value: 'standard' },
  { label: '计重品', value: 'weight' },
]

const config: SceneConfig = {
  title: '属性联动',
  description: '动态 disabled / required / placeholder / componentProps',

  initialValues: {
    enableRemark: false, remark: '', contactType: 'phone', contactValue: '',
    productType: 'standard', quantity: 1, isVip: false, vipCompany: '', vipId: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '150px' },
    properties: {
      enableRemark: { type: 'boolean', title: '启用备注', default: false },
      remark: {
        type: 'string', title: '备注内容', component: 'Textarea',
        componentProps: { placeholder: '请先开启' }, disabled: true,
        reactions: [{
          watch: 'enableRemark',
          when: '{{$values.enableRemark === true}}',
          fulfill: { state: { disabled: false } },
          otherwise: { state: { disabled: true } },
        }],
      },
      contactType: {
        type: 'string', title: '联系方式类型', default: 'phone', enum: CONTACT_TYPE_OPTIONS,
      },
      /* 使用多条件 reactions 替代复杂 run 函数 */
      contactValue: {
        type: 'string', title: '联系方式', required: true,
        componentProps: { placeholder: '请输入手机号' },
        reactions: [
          {
            watch: 'contactType',
            when: '{{$values.contactType === "phone"}}',
            fulfill: { state: { required: true }, componentProps: { placeholder: '11 位手机号' } },
          },
          {
            watch: 'contactType',
            when: '{{$values.contactType === "email"}}',
            fulfill: { state: { required: true }, componentProps: { placeholder: '邮箱地址' } },
          },
          {
            watch: 'contactType',
            when: '{{$values.contactType === "wechat"}}',
            fulfill: { state: { required: false }, componentProps: { placeholder: '微信号（选填）' } },
          },
        ],
      },
      productType: {
        type: 'string', title: '产品类型', component: 'RadioGroup',
        default: 'standard', enum: PRODUCT_TYPE_OPTIONS,
      },
      quantity: {
        type: 'number', title: '数量', default: 1, description: '根据产品类型调整 step',
        reactions: [{
          watch: 'productType',
          when: '{{$values.productType === "weight"}}',
          fulfill: { componentProps: { min: 0.01, step: 0.01, addonAfter: 'kg' } },
          otherwise: { componentProps: { min: 1, step: 1, addonAfter: '件' } },
        }],
      },
      isVip: { type: 'boolean', title: 'VIP 用户', default: false, description: '开启后公司名称和工号必填' },
      vipCompany: {
        type: 'string', title: '公司名称', componentProps: { placeholder: 'VIP 必填' },
        reactions: [{
          watch: 'isVip',
          when: '{{$values.isVip === true}}',
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        }],
      },
      vipId: {
        type: 'string', title: '工号', componentProps: { placeholder: 'VIP 必填' },
        reactions: [{
          watch: 'isVip',
          when: '{{$values.isVip === true}}',
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        }],
      },
    },
  },
}

export default config
