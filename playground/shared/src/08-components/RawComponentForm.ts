import type { SceneConfig } from '../types'

/**
 * 场景：无装饰器自定义组件
 *
 * 演示 registerComponent(name, component) 不传 defaultDecorator 的效果：
 * - 组件裸渲染，不被 FormItem 包裹
 * - 没有 label / 必填标记 / 错误提示包裹
 * - 适用于全宽编辑器类组件（代码/签名等）
 *
 * 对比：ColorPicker 注册时带 { defaultDecorator: 'FormItem' }，会被 FormItem 包裹。
 * 而 SignaturePad 和 CodeEditor 注册时不带 defaultDecorator，裸渲染。
 */

const DEFAULT_CODE = 'function hello() {\n  return "world";\n}'

const config: SceneConfig = {
  title: '无装饰器组件',
  description: 'registerComponent 不传 defaultDecorator — 裸渲染，无 FormItem 包裹',

  initialValues: {
    title: '代码审查',
    code: DEFAULT_CODE,
    signature: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      title: {
        type: 'string',
        title: '标题',
        required: true,
        description: '此字段用默认 Input + FormItem（有 label 包裹）',
      },
      code: {
        type: 'string',
        title: '代码',
        component: 'CodeEditor',
        decorator: '',
        description: 'decorator:"" → 不被 FormItem 包裹，无 label 和错误提示',
      },
      signature: {
        type: 'string',
        title: '签名',
        component: 'SignaturePad',
        decorator: '',
        description: 'decorator:"" → 同样裸渲染',
      },
    },
  },
}

export default config
