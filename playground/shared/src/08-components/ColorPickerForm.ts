import type { SceneConfig } from '../types'

/**
 * 场景：颜色选择器
 *
 * 自定义组件 ColorPicker — 原生 color input + 预设色板 + HEX 文本输入。
 * 组件在 playground/react 中实现并注册。
 */

const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']

const config: SceneConfig = {
  title: '颜色选择器',
  description: '自定义组件 ColorPicker — 原生 color input + 预设色板 + HEX 输入',

  initialValues: {
    themeName: '自定义主题',
    primaryColor: '#1677ff',
    bgColor: '#ffffff',
    textColor: '#333333',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      themeName: { type: 'string', title: '主题名称', required: true, componentProps: { placeholder: '请输入主题名称' } },
      primaryColor: { type: 'string', title: '主色调', required: true, component: 'ColorPicker', componentProps: { presets: PRESETS } },
      bgColor: { type: 'string', title: '背景色', component: 'ColorPicker', componentProps: { presets: PRESETS } },
      textColor: { type: 'string', title: '文字颜色', component: 'ColorPicker', componentProps: { presets: PRESETS } },
    },
  },
}

export default config
