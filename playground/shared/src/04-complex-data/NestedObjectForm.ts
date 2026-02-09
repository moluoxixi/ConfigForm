import type { SceneConfig } from '../types'

/**
 * 场景：嵌套对象
 *
 * 演示 type: 'object' 的真正嵌套数据路径（非 void 分组）：
 * - type: 'object' 创建嵌套数据路径（profile.name、address.city）
 * - type: 'void' 仅做视觉分组（不影响数据路径）
 * - 提交数据体现嵌套结构
 *
 * 关键区别：
 * - void Card 下的字段 → 扁平路径（name, email）
 * - object 下的字段 → 嵌套路径（profile.name, address.city）
 */

const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const PROVINCE_OPTIONS = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' },
]

const config: SceneConfig = {
  title: '嵌套对象',
  description: 'type: object 嵌套数据路径 — profile.name / address.city / emergency.contact.phone',

  initialValues: {
    profile: {
      name: '张三',
      age: 28,
      gender: 'male',
    },
    address: {
      province: 'beijing',
      city: '北京',
      detail: '朝阳区建国路88号',
    },
    emergency: {
      contact: {
        name: '李女士',
        phone: '13900139000',
        relation: '配偶',
      },
    },
    remark: '这个字段不在嵌套对象内，是扁平路径',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交（查看嵌套结构）', reset: '重置' } },
    properties: {
      profile: {
        type: 'object',
        title: '个人信息（type: object → 嵌套路径 profile.*）',
        component: 'LayoutCard',
        componentProps: { title: '个人信息 — 数据路径: profile.*' },
        properties: {
          name: {
            type: 'string',
            title: '姓名',
            required: true,
            description: '数据路径: profile.name',
          },
          age: {
            type: 'number',
            title: '年龄',
            description: '数据路径: profile.age',
            componentProps: { min: 0, max: 150, style: 'width: 200px' },
          },
          gender: {
            type: 'string',
            title: '性别',
            description: '数据路径: profile.gender',
            component: 'RadioGroup',
            enum: GENDER_OPTIONS,
          },
        },
      },
      address: {
        type: 'object',
        title: '地址（type: object → 嵌套路径 address.*）',
        component: 'LayoutCard',
        componentProps: { title: '地址信息 — 数据路径: address.*' },
        properties: {
          province: {
            type: 'string',
            title: '省份',
            description: '数据路径: address.province',
            enum: PROVINCE_OPTIONS,
          },
          city: {
            type: 'string',
            title: '城市',
            description: '数据路径: address.city',
          },
          detail: {
            type: 'string',
            title: '详细地址',
            description: '数据路径: address.detail',
            component: 'Textarea',
            componentProps: { rows: 2 },
          },
        },
      },
      emergency: {
        type: 'object',
        title: '紧急联系（type: object → 二级嵌套 emergency.contact.*）',
        component: 'LayoutCard',
        componentProps: { title: '紧急联系人 — 数据路径: emergency.contact.*' },
        properties: {
          contact: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: '联系人姓名',
                required: true,
                description: '数据路径: emergency.contact.name',
              },
              phone: {
                type: 'string',
                title: '联系电话',
                required: true,
                description: '数据路径: emergency.contact.phone',
                rules: [{ format: 'phone', message: '请输入有效手机号' }],
              },
              relation: {
                type: 'string',
                title: '关系',
                description: '数据路径: emergency.contact.relation',
              },
            },
          },
        },
      },
      remark: {
        type: 'string',
        title: '备注（扁平路径）',
        description: '数据路径: remark — 不在嵌套对象内，是顶层扁平字段',
        component: 'Textarea',
        componentProps: { rows: 2 },
      },
    },
  },
}

export default config
