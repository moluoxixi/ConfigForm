import type { SceneConfig } from '../types'

/**
 * 场景：数据转换
 *
 * 演示 displayFormat / inputParse / submitTransform / submitPath 数据转换能力：
 * - 价格：用户输入元，内部存储分，显示带"¥"前缀，提交时为整数分
 * - 手机号：输入原始号码，显示脱敏格式（138****0000），提交原始值
 * - 标签：用户输入逗号分隔字符串，提交时转为数组
 * - 邮箱：提交到 submitPath 指定的不同路径
 */

const config: SceneConfig = {
  title: '数据转换',
  description: 'displayFormat / inputParse / submitTransform / submitPath — 完整数据变换',

  initialValues: {
    priceCent: 9990,
    phoneRaw: '13800138000',
    fullName: '张三',
    tags: 'react,vue,typescript',
    contactEmail: 'test@example.com',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '160px', actions: { submit: '提交（查看控制台）', reset: '重置' } },
    properties: {
      priceCent: {
        type: 'number',
        title: '价格（分→元）',
        description: '内部存分，UI 显示元（¥99.90），输入元自动转分',
        componentProps: { style: 'width: 300px', min: 0, step: 100 },
        displayFormat: (value: unknown): string => {
          const num = Number(value) || 0
          return `¥${(num / 100).toFixed(2)}`
        },
        inputParse: (inputValue: unknown): number => {
          return Math.round(Number(inputValue) || 0)
        },
        submitTransform: (value: unknown): number => {
          return Math.round(Number(value) || 0)
        },
      },
      phoneRaw: {
        type: 'string',
        title: '手机号（脱敏显示）',
        description: '显示 138****0000，提交原始号码',
        componentProps: { style: 'width: 300px', placeholder: '请输入手机号' },
        displayFormat: (value: unknown): string => {
          const str = String(value || '')
          if (str.length >= 11) {
            return `${str.slice(0, 3)}****${str.slice(-4)}`
          }
          return str
        },
      },
      fullName: {
        type: 'string',
        title: '姓名',
        description: '输入时自动去除首尾空格',
        componentProps: { style: 'width: 300px' },
        inputParse: (inputValue: unknown): string => {
          return String(inputValue || '').trim()
        },
      },
      tags: {
        type: 'string',
        title: '标签（逗号分隔→数组）',
        description: '输入逗号分隔字符串，提交时自动转为 string[]',
        componentProps: { style: 'width: 300px', placeholder: '如: react,vue,typescript' },
        submitTransform: (value: unknown): string[] => {
          const str = String(value || '')
          return str.split(',').map(s => s.trim()).filter(Boolean)
        },
      },
      contactEmail: {
        type: 'string',
        title: '联系邮箱（submitPath 映射）',
        description: '字段路径 contactEmail → 提交路径 contact.email',
        componentProps: { style: 'width: 300px', placeholder: '提交时映射到 contact.email' },
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
        submitPath: 'contact.email',
      },
    },
  },
}

export default config
