import type { SceneConfig } from '../types'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：提交重试插件
 *
 * 演示 lowerCodePlugin.submitRetry 的提交重试能力：
 * - 三种重试策略：fixed / exponential / linear
 * - 最大重试次数配置
 * - 重试前回调（可取消）
 * - 重试成功/耗尽回调
 * - AbortSignal 取消支持
 */

const config: SceneConfig = {
  title: '提交重试',
  description: 'lowerCodePlugin.submitRetry — 指数退避 / 固定间隔 / 线性递增重试策略',

  initialValues: {
    apiEndpoint: '/api/save',
    payload: 'test data',
    retryStrategy: 'exponential',
    maxRetries: 3,
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交（模拟失败+重试）', reset: '重置' } },
    properties: {
      apiEndpoint: {
        type: 'string',
        title: 'API 地址',
        required: true,
        componentProps: { placeholder: '模拟的 API 地址' },
      },
      payload: {
        type: 'string',
        title: '提交数据',
        required: true,
        component: 'Textarea',
        componentProps: { rows: 2, placeholder: '要提交的数据' },
      },
      retryStrategy: {
        type: 'string',
        title: '重试策略',
        component: 'RadioGroup',
        enum: [
          { label: '指数退避 (exponential)', value: 'exponential' },
          { label: '固定间隔 (fixed)', value: 'fixed' },
          { label: '线性递增 (linear)', value: 'linear' },
        ],
        description: 'exponential: 1s→2s→4s, fixed: 1s→1s→1s, linear: 1s→2s→3s',
      },
      maxRetries: {
        type: 'number',
        title: '最大重试次数',
        componentProps: { min: 0, max: 10, style: 'width: 200px' },
      },
    },
  },

  plugins: [
    lowerCodePlugin({
      history: false,
      dirtyChecker: false,
      acl: false,
      subForm: false,
      masking: false,
      submitRetry: {
        maxRetries: 3,
        strategy: 'exponential',
        baseDelay: 1000,
      },
    }),
  ],
}

export default config
