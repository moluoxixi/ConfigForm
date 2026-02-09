import type { SceneConfig } from '../types'

/**
 * 场景：手写签名板
 *
 * 自定义组件 SignaturePad — 基于 Canvas 的手写签名，输出 Base64 PNG。
 * 组件在 playground/react 中实现并注册。
 */

const config: SceneConfig = {
  title: '手写签名板',
  description: '自定义组件 SignaturePad — Canvas 手写签名 / Base64 数据同步',

  initialValues: {
    signerName: '',
    signatureData: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      signerName: { type: 'string', title: '签名人', required: true, componentProps: { style: 'width: 300px' } },
      signatureData: { type: 'string', title: '手写签名', component: 'SignaturePad' },
    },
  },
}

export default config
