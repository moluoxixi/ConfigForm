import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '地图选点',
  description: '模拟地图选点（可接入 @vuemap/vue-amap）',

  initialValues: {
    locationName: '天安门广场',
    lng: 116.3912,
    lat: 39.9075,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      locationName: { type: 'string', title: '地点名称', required: true, componentProps: { placeholder: '请输入地点名称' } },
      lng: { type: 'number', title: '经度', componentProps: { step: 0.0001, style: 'width: 200px' } },
      lat: { type: 'number', title: '纬度', componentProps: { step: 0.0001, style: 'width: 200px' } },
    },
  },
}

export default config
