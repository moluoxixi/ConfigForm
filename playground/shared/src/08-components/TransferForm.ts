import type { SceneConfig } from '../types'

/** 操作标签 */
const ACTIONS = ['查看', '编辑', '删除', '审核', '导出']

/** 资源标签 */
const RESOURCES = ['用户', '订单', '商品', '报表']

/** 权限列表（20 项） */
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({
  key: `perm-${i + 1}`,
  title: `权限${String(i + 1).padStart(2, '0')} - ${ACTIONS[i % 5]}${RESOURCES[Math.floor(i / 5)]}`,
}))

const config: SceneConfig = {
  title: '穿梭框',
  description: 'antd Transfer / 权限分配 / 搜索过滤',

  initialValues: {
    roleName: '管理员',
    permissions: ['perm-1', 'perm-3', 'perm-5'],
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      roleName: { type: 'string', title: '角色名称', required: true, componentProps: { placeholder: '请输入角色名称', style: 'width: 300px' } },
      permissions: { type: 'string', title: '权限分配', required: true, component: 'TransferPicker', componentProps: { dataSource: PERMISSIONS } },
    },
  },
}

export default config
