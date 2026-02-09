import type { SceneConfig } from '../types'

/**
 * 场景：readPretty 组件映射
 *
 * 演示 registerComponent 的 readPrettyComponent 选项：
 * - 编辑态：渲染 ColorPicker（色块 + HEX 输入 + 预设色板）
 * - 阅读态：自动替换为 PreviewColorPicker（色块 + 纯文本 HEX）
 *
 * 通过 StatusTabs 切换编辑态/阅读态，观察组件自动切换。
 *
 * 注册方式：
 * ```ts
 * registerComponent('ColorPicker', ColorPicker, {
 *   defaultDecorator: 'FormItem',
 *   readPrettyComponent: PreviewColorPicker,
 * })
 * ```
 */

const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']

const config: SceneConfig = {
  title: 'readPretty 组件映射',
  description: 'readPrettyComponent — 编辑态 ColorPicker / 阅读态 PreviewColorPicker 自动切换',

  initialValues: {
    themeName: '品牌主题',
    primaryColor: '#1677ff',
    accentColor: '#52c41a',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      themeName: {
        type: 'string',
        title: '主题名称',
        required: true,
        description: '普通 Input — 切换阅读态显示纯文本',
      },
      primaryColor: {
        type: 'string',
        title: '主色调',
        required: true,
        component: 'ColorPicker',
        componentProps: { presets: PRESETS },
        description: '编辑态：ColorPicker / 阅读态：PreviewColorPicker（色块+HEX文本）',
      },
      accentColor: {
        type: 'string',
        title: '强调色',
        component: 'ColorPicker',
        componentProps: { presets: PRESETS },
        description: '同上，切换阅读态观察组件替换',
      },
    },
  },
}

export default config
