import type { SceneConfig } from '../types'

/**
 * 场景：显隐联动
 *
 * 覆盖：用户类型切换 / 开关控制多字段 / 嵌套显隐
 */

/** 用户类型选项 */
const USER_TYPE_OPTIONS = [
  { label: '个人', value: 'personal' },
  { label: '企业', value: 'business' },
]

/** 通知频率选项 */
const FREQUENCY_OPTIONS = [
  { label: '实时', value: 'realtime' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
]

const config: SceneConfig = {
  title: '显隐联动',
  description: '用户类型切换 / 开关控制多字段 / 嵌套显隐',

  initialValues: {
    userType: 'personal', realName: '', idCard: '', companyName: '', taxNumber: '',
    enableNotify: false, notifyEmail: '', notifyFrequency: undefined,
    hasAddress: false, city: '', hasDetailAddress: false, detailAddress: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '140px' },
    properties: {
      userType: {
        type: 'string', title: '用户类型', required: true, component: 'RadioGroup',
        default: 'personal', enum: USER_TYPE_OPTIONS,
      },
      realName: {
        type: 'string', title: '真实姓名', required: true,
        componentProps: { placeholder: '请输入' }, excludeWhenHidden: true,
        reactions: [{ watch: 'userType', when: (v: any) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      idCard: {
        type: 'string', title: '身份证号',
        componentProps: { placeholder: '18 位' }, excludeWhenHidden: true,
        rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }],
        reactions: [{ watch: 'userType', when: (v: any) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      companyName: {
        type: 'string', title: '公司名称', required: true,
        componentProps: { placeholder: '请输入' }, visible: false, excludeWhenHidden: true,
        reactions: [{ watch: 'userType', when: (v: any) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      taxNumber: {
        type: 'string', title: '税号',
        componentProps: { placeholder: '请输入' }, visible: false, excludeWhenHidden: true,
        reactions: [{ watch: 'userType', when: (v: any) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      enableNotify: { type: 'boolean', title: '开启通知', default: false },
      notifyEmail: {
        type: 'string', title: '通知邮箱',
        componentProps: { placeholder: '邮箱' }, visible: false, excludeWhenHidden: true,
        rules: [{ format: 'email', message: '无效邮箱' }],
        reactions: [{ watch: 'enableNotify', when: (v: any) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      notifyFrequency: {
        type: 'string', title: '通知频率', visible: false, excludeWhenHidden: true,
        enum: FREQUENCY_OPTIONS,
        reactions: [{ watch: 'enableNotify', when: (v: any) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      hasAddress: { type: 'boolean', title: '填写地址', default: false },
      city: {
        type: 'string', title: '城市', visible: false, excludeWhenHidden: true,
        reactions: [{ watch: 'hasAddress', when: (v: any) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      hasDetailAddress: {
        type: 'boolean', title: '填写详细地址', visible: false, default: false,
        reactions: [{ watch: 'hasAddress', when: (v: any) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
      detailAddress: {
        type: 'string', title: '详细地址', component: 'Textarea', visible: false, excludeWhenHidden: true,
        reactions: [{ watch: ['hasAddress', 'hasDetailAddress'], when: (v: any) => v[0] === true && v[1] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
      },
    },
  },

  fields: [
    { name: 'userType', label: '用户类型', required: true, component: 'RadioGroup', dataSource: USER_TYPE_OPTIONS },
    { name: 'realName', label: '真实姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'idCard', label: '身份证号', component: 'Input', componentProps: { placeholder: '18 位' }, rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }] },
    { name: 'companyName', label: '公司名称', required: true, component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'taxNumber', label: '税号', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'enableNotify', label: '开启通知', component: 'Switch' },
    { name: 'notifyEmail', label: '通知邮箱', component: 'Input', componentProps: { placeholder: '邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'notifyFrequency', label: '通知频率', component: 'Select', dataSource: FREQUENCY_OPTIONS, componentProps: { placeholder: '请选择' } },
    { name: 'hasAddress', label: '填写地址', component: 'Switch' },
    { name: 'city', label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } },
    { name: 'hasDetailAddress', label: '填写详细地址', component: 'Switch' },
    { name: 'detailAddress', label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址' } },
  ],
}

export default config
