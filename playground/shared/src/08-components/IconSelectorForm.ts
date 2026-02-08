import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '图标选择器',
  description: '图标网格选择 / 搜索过滤',

  initialValues: {
    menuName: '首页',
    icon: 'Home',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      menuName: { type: 'string', title: '菜单名称', required: true, componentProps: { placeholder: '请输入菜单名称', style: 'width: 300px' } },
      icon: { type: 'string', title: '图标', required: true, component: 'IconSelector' },
    },
  },
}

export default config
