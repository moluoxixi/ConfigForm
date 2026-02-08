import type { SceneConfig } from '../types'

/**
 * 场景：数组字段
 *
 * 覆盖：增删 / 排序 / min-max 数量限制
 */

const config: SceneConfig = {
  title: '数组字段',
  description: '增删 / 排序 / min-max 数量限制',

  initialValues: {
    groupName: '默认分组',
    contacts: [{ name: '', phone: '', email: '' }],
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '120px' },
    properties: {
      groupName: {
        type: 'string',
        title: '分组名称',
        required: true,
        componentProps: { placeholder: '请输入分组名称', style: 'width: 300px' },
      },
      contacts: {
        type: 'array',
        title: '联系人列表',
        minItems: 1,
        maxItems: 8,
        itemTemplate: { name: '', phone: '', email: '' },
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '姓名', componentProps: { placeholder: '姓名' } },
            phone: { type: 'string', title: '电话', componentProps: { placeholder: '电话' } },
            email: { type: 'string', title: '邮箱', componentProps: { placeholder: '邮箱' } },
          },
        },
      },
    },
  },
}

export default config
