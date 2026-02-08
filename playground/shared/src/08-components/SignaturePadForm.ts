import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '手写签名板',
  description: 'Canvas 手写签名 / Base64 数据同步',

  initialValues: {
    signerName: '',
    signatureData: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      signerName: { type: 'string', title: '签名人', required: true, componentProps: { style: 'width: 300px' } },
      signatureData: { type: 'string', title: '手写签名', component: 'SignaturePad' },
    },
  },
}

export default config
