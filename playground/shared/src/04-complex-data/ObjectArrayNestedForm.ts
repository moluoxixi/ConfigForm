import type { SceneConfig } from '../types'

/**
 * 场景：对象数组嵌套
 *
 * 覆盖：联系人数组 → 每人含嵌套电话数组
 */

const config: SceneConfig = {
  title: '对象数组嵌套',
  description: '联系人数组 → 每人含嵌套电话数组',

  initialValues: {
    teamName: '开发团队',
    contacts: [
      { name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] },
      { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] },
    ],
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '120px' },
    properties: {
      teamName: {
        type: 'string',
        title: '团队名称',
        required: true,
        componentProps: { placeholder: '请输入团队名称', style: 'width: 300px' },
      },
      contacts: {
        type: 'array',
        title: '团队成员',
        minItems: 1,
        maxItems: 10,
        itemTemplate: { name: '', role: '', phones: [{ number: '', label: '手机' }] },
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '姓名', required: true, componentProps: { placeholder: '姓名' } },
            role: { type: 'string', title: '角色', componentProps: { placeholder: '角色' } },
            phones: {
              type: 'array',
              title: '电话列表',
              minItems: 1,
              maxItems: 5,
              itemTemplate: { number: '', label: '手机' },
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', title: '标签', componentProps: { placeholder: '标签', style: 'width: 80px' } },
                  number: { type: 'string', title: '号码', componentProps: { placeholder: '号码' } },
                },
              },
            },
          },
        },
      },
    },
  },

  fields: [
    { name: 'teamName', label: '团队名称', required: true, component: 'Input', componentProps: { placeholder: '请输入团队名称', style: 'width: 300px' } },
    { name: 'contacts', label: '团队成员', component: 'ArrayField', componentProps: { minItems: 1, maxItems: 10, itemTemplate: { name: '', role: '', phones: [{ number: '', label: '手机' }] } } },
  ],
}

export default config
