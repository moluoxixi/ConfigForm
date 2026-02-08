import type { SceneConfig } from '../types'

/**
 * 场景：自定义装饰器
 *
 * 演示自定义 decorator 替代默认 FormItem 的装饰器包裹能力。
 * - CardDecorator：卡片风格（带背景和圆角的卡片包裹）
 * - InlineDecorator：内联风格（左标签右内容的紧凑布局）
 * - 未指定 decorator 时使用默认 FormItem
 */

const config: SceneConfig = {
  title: '自定义装饰器',
  description: '自定义 decorator 替代默认 FormItem，支持卡片风格和内联风格装饰器',

  initialValues: {
    projectName: '',
    projectCode: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    budget: 0,
    startDate: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'top', actions: { submit: '提交', reset: '重置' } },
    properties: {
      projectName: {
        type: 'string',
        title: '项目名称',
        required: true,
        decorator: 'CardDecorator',
        decoratorProps: {},
        description: '请输入项目的完整名称',
      },
      projectCode: {
        type: 'string',
        title: '项目编号',
        required: true,
        decorator: 'CardDecorator',
        rules: [{ pattern: '^[A-Z]{2}-\\d{4}$', message: '格式：XX-0000' }],
      },
      description: {
        type: 'string',
        title: '项目描述',
        component: 'Textarea',
        decorator: 'CardDecorator',
        description: '不超过500字',
      },
      contactName: {
        type: 'string',
        title: '联系人',
        required: true,
        decorator: 'InlineDecorator',
      },
      contactPhone: {
        type: 'string',
        title: '电话',
        decorator: 'InlineDecorator',
        rules: [{ format: 'phone', message: '请输入有效手机号' }],
      },
      contactEmail: {
        type: 'string',
        title: '邮箱',
        decorator: 'InlineDecorator',
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
      },
      budget: {
        type: 'number',
        title: '预算（万元）',
        componentProps: { min: 0 },
      },
      startDate: {
        type: 'date',
        title: '开始日期',
      },
    },
  },
}

export default config
