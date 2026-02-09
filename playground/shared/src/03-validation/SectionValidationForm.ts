import type { SceneConfig } from '../types'

/**
 * 场景：分区域验证
 *
 * 演示 Form.validateSection() 和 Form.clearSectionErrors() 的分步验证能力：
 * - Steps 场景：每步仅验证当前步骤的字段
 * - 通配符模式匹配字段
 * - 精确字段路径数组
 * - 清除指定区域的验证错误
 */

const config: SceneConfig = {
  title: '分区域验证',
  description: 'validateSection + clearSectionErrors — 分步表单的逐步验证',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
    department: '',
    address: '',
    city: '',
    zipCode: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '全部提交', reset: '重置' } },
    properties: {
      step1: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '第一步：基本信息（validateSection 验证 name / phone / email）' },
        properties: {
          name: {
            type: 'string',
            title: '姓名',
            required: true,
            rules: [{ minLength: 2, message: '姓名至少 2 个字符' }],
            componentProps: { placeholder: '请输入姓名' },
          },
          phone: {
            type: 'string',
            title: '手机号',
            required: true,
            rules: [{ format: 'phone', message: '请输入有效手机号' }],
            componentProps: { placeholder: '请输入手机号' },
          },
          email: {
            type: 'string',
            title: '邮箱',
            required: true,
            rules: [{ format: 'email', message: '请输入有效邮箱' }],
            componentProps: { placeholder: '请输入邮箱' },
          },
        },
      },
      step2: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '第二步：工作信息（validateSection 验证 company / position / department）' },
        properties: {
          company: {
            type: 'string',
            title: '公司',
            required: true,
            componentProps: { placeholder: '请输入公司名称' },
          },
          position: {
            type: 'string',
            title: '职位',
            required: true,
            componentProps: { placeholder: '请输入职位' },
          },
          department: {
            type: 'string',
            title: '部门',
            enum: [
              { label: '技术部', value: 'tech' },
              { label: '产品部', value: 'product' },
              { label: '设计部', value: 'design' },
            ],
          },
        },
      },
      step3: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '第三步：联系地址（validateSection 验证 address / city / zipCode）' },
        properties: {
          address: {
            type: 'string',
            title: '地址',
            required: true,
            component: 'Textarea',
            componentProps: { rows: 2, placeholder: '请输入详细地址' },
          },
          city: {
            type: 'string',
            title: '城市',
            required: true,
            componentProps: { placeholder: '请输入城市' },
          },
          zipCode: {
            type: 'string',
            title: '邮编',
            rules: [{ pattern: '^\\d{6}$', message: '邮编为 6 位数字' }],
            componentProps: { placeholder: '如: 100000' },
          },
        },
      },
    },
  },
}

export default config
