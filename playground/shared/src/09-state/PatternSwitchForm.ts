import type { FormInstance } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：表单模式切换
 *
 * 演示 pattern 三种模式：editable / disabled / preview
 * - 表单级模式切换（影响所有字段）
 * - 字段级模式覆盖（个别字段不受表单模式影响）
 */

const PATTERN_OPTIONS = [
  { label: '可编辑 (editable)', value: 'editable' },
  { label: '禁用 (disabled)', value: 'disabled' },
  { label: '预览 (preview)', value: 'preview' },
]

const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const config: SceneConfig = {
  title: '表单模式切换',
  description: 'pattern: editable / disabled / preview — 表单级 + 字段级模式',

  initialValues: {
    name: '张三',
    email: 'zhangsan@example.com',
    gender: 'male',
    age: 28,
    phone: '13800138000',
    bio: '这是一段个人简介，用于测试不同模式下的展示效果。',
    alwaysEditable: '',
  },

  effects: (form: FormInstance): void => {
    /**
     * 通过 effects 监听模式切换字段的值变化，
     * 动态修改表单级 pattern。
     *
     * 注意：_patternSwitch 以下划线开头，表示控制字段（非业务数据）。
     */
    form.onFieldValueChange('_patternSwitch', (value: unknown) => {
      const pattern = value as 'editable' | 'disabled' | 'preview'
      form.pattern = pattern
    })
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      _patternSwitch: {
        type: 'string',
        title: '切换表单模式',
        component: 'RadioGroup',
        enum: PATTERN_OPTIONS,
        default: 'editable',
        description: '切换后所有字段（除「始终可编辑」外）跟随变化',
      },
      name: {
        type: 'string',
        title: '姓名',
        required: true,
        componentProps: { placeholder: '请输入姓名' },
      },
      email: {
        type: 'string',
        title: '邮箱',
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
      },
      gender: {
        type: 'string',
        title: '性别',
        component: 'RadioGroup',
        enum: GENDER_OPTIONS,
      },
      age: {
        type: 'number',
        title: '年龄',
        componentProps: { min: 0, max: 150, style: 'width: 200px' },
      },
      phone: {
        type: 'string',
        title: '手机号',
        rules: [{ format: 'phone', message: '请输入有效手机号' }],
      },
      bio: {
        type: 'string',
        title: '个人简介',
        component: 'Textarea',
        componentProps: { rows: 3 },
      },
      alwaysEditable: {
        type: 'string',
        title: '始终可编辑',
        pattern: 'editable',
        description: '字段级 pattern 覆盖表单级设置',
        componentProps: { placeholder: '无论表单模式如何，此字段始终可编辑' },
      },
    },
  },
}

export default config
