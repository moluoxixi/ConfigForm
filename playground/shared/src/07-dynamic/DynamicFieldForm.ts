import type { SceneConfig } from '../types'

/**
 * 场景：动态增删字段
 *
 * 通过 CheckboxGroup 控制哪些字段可见。
 * 每个可控字段都有 reactions 监听 _selectedFields，
 * 根据是否被选中切换 display 状态。
 */

const FIELD_OPTIONS = [
  { label: '姓名', value: 'name' },
  { label: '邮箱', value: 'email' },
  { label: '电话', value: 'phone' },
  { label: '公司', value: 'company' },
  { label: '职位', value: 'position' },
  { label: '备注', value: 'remark' },
]

/** 生成通用的显隐联动 reaction：监听 _selectedFields，判断数组是否包含当前字段名 */
function makeVisibilityReaction(fieldName: string): object[] {
  return [{
    watch: '_selectedFields',
    when: `{{Array.isArray($values._selectedFields) && $values._selectedFields.includes("${fieldName}")}}`,
    fulfill: { state: { display: 'visible' } },
    otherwise: { state: { display: 'none' } },
  }]
}

const config: SceneConfig = {
  title: '动态增删字段',
  description: 'CheckboxGroup 控制字段显隐 — 勾选后对应字段出现',

  initialValues: {
    _selectedFields: ['name', 'email'],
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '100px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      _selectedFields: {
        type: 'string',
        title: '显示字段',
        component: 'CheckboxGroup',
        default: ['name', 'email'],
        dataSource: FIELD_OPTIONS,
        description: '勾选后对应字段出现，取消勾选后隐藏',
      },
      name: {
        type: 'string', title: '姓名', required: true,
        rules: [{ minLength: 2, message: '至少 2 字' }],
        reactions: makeVisibilityReaction('name'),
      },
      email: {
        type: 'string', title: '邮箱',
        rules: [{ format: 'email', message: '无效邮箱' }],
        reactions: makeVisibilityReaction('email'),
      },
      phone: {
        type: 'string', title: '电话',
        visible: false,
        rules: [{ format: 'phone', message: '无效手机号' }],
        reactions: makeVisibilityReaction('phone'),
      },
      company: {
        type: 'string', title: '公司',
        visible: false,
        reactions: makeVisibilityReaction('company'),
      },
      position: {
        type: 'string', title: '职位',
        visible: false,
        reactions: makeVisibilityReaction('position'),
      },
      remark: {
        type: 'string', title: '备注',
        visible: false,
        component: 'Textarea', componentProps: { rows: 3 },
        reactions: makeVisibilityReaction('remark'),
      },
    },
  },
}

export default config
