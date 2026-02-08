import type { SceneConfig } from '../types'

const config: SceneConfig = {
  title: '文件、图片上传',
  description: '文件+图片上传 / antd Upload / 三种模式',

  initialValues: {
    title: '',
    description: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题' } },
      description: { type: 'string', title: '说明', component: 'Textarea', componentProps: { rows: 3, placeholder: '上传说明' } },
    },
  },

  fields: [
    { name: 'title', label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } },
    { name: 'files', label: '附件上传', component: 'FileUpload' },
    { name: 'images', label: '图片上传', component: 'ImageUpload', componentProps: { maxCount: 6 } },
  ],
}

export default config
