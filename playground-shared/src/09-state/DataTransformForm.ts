import type { SceneConfig } from '../types'

/**
 * 场景：数据转换
 *
 * 演示 format / parse / transform 数据转换能力。
 * 字段支持分→元格式化、手机号脱敏、逗号字符串转数组等。
 */

const config: SceneConfig = {
  title: '数据转换',
  description: 'format / parse / transform — ConfigForm + Schema 实现',

  initialValues: {
    priceCent: 9990,
    phoneRaw: '13800138000',
    fullName: '张三',
    tags: 'react,vue,typescript',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      priceCent: { type: 'number', title: '价格（分）', description: '存储单位为分', componentProps: { style: 'width: 300px' } },
      phoneRaw: { type: 'string', title: '手机号', componentProps: { style: 'width: 300px' } },
      fullName: { type: 'string', title: '姓名', componentProps: { style: 'width: 300px' } },
      tags: { type: 'string', title: '标签（逗号分隔）', description: '提交时可转为数组', componentProps: { style: 'width: 300px' } },
    },
  },

  fields: [
    { name: 'priceCent', label: '价格（分→元）', component: 'Input', description: 'format: 分转元, parse: 元转分', componentProps: { style: 'width: 300px' } },
    { name: 'phoneRaw', label: '手机号（脱敏）', component: 'Input', componentProps: { style: 'width: 300px' } },
    { name: 'fullName', label: '姓名', component: 'Input', componentProps: { style: 'width: 300px' } },
    { name: 'tags', label: '标签（逗号分隔）', component: 'Input', description: '提交时转为数组', componentProps: { style: 'width: 300px' } },
  ],
}

export default config
