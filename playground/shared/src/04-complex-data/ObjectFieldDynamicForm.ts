import type { SceneConfig } from '../types'
import { onFieldInit } from '@moluoxixi/core'

/**
 * 场景：ObjectField 动态属性
 *
 * 演示 ObjectField 独立模型的能力：
 * - 在运行时通过 effects 动态为对象字段添加/检查属性
 * - ObjectField 的 addProperty / existProperty / getPropertyNames
 *
 * 核心功能覆盖：
 * - ObjectField 独立模型
 * - createObjectField（通过 schema type='object'）
 * - Effects API（onFieldInit）
 *
 * 注意：ObjectField 的 addProperty/removeProperty 是运行时 API，
 * 在 Schema 驱动模式下，嵌套对象的子字段由 SchemaField 递归创建。
 * 本示例展示的是 Schema 声明的嵌套对象 + Effects 中读取对象属性的能力。
 */

const config: SceneConfig = {
  title: 'ObjectField 动态属性',
  description: '嵌套对象字段 + Effects 动态属性操作',

  initialValues: {
    userInfo: {
      name: '张三',
      age: 28,
      email: 'zhangsan@example.com',
    },
    serverConfig: {
      host: 'localhost',
      port: 8080,
    },
    log: '等待交互...',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      userInfo: {
        type: 'object',
        title: '用户信息（对象字段）',
        component: 'LayoutCard',
        componentProps: { title: '用户信息' },
        properties: {
          name: { type: 'string', title: '姓名', required: true },
          age: { type: 'number', title: '年龄', componentProps: { min: 0, max: 150, style: 'width: 100%' } },
          email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
        },
      },
      serverConfig: {
        type: 'object',
        title: '服务器配置（对象字段）',
        component: 'LayoutCard',
        componentProps: { title: '服务器配置' },
        properties: {
          host: { type: 'string', title: '主机地址', required: true },
          port: { type: 'number', title: '端口号', required: true, componentProps: { min: 1, max: 65535, style: 'width: 100%' } },
        },
      },
      log: {
        type: 'string',
        title: '对象属性日志',
        component: 'Textarea',
        readOnly: true,
        componentProps: { rows: 6 },
        description: '记录 effects 中读取的对象属性信息',
      },
    },
  },

  effects: (form) => {
    const logs: string[] = []

    /**
     * 监听嵌套对象字段的子字段初始化，
     * 记录对象结构信息，验证 ObjectField 的属性感知能力。
     */
    onFieldInit(form, 'userInfo.*', (field) => {
      logs.push(`[userInfo] 子字段初始化: ${field.path} = ${JSON.stringify(field.value)}`)
      form.setFieldState('log', { value: logs.join('\n') })
    })

    onFieldInit(form, 'serverConfig.*', (field) => {
      logs.push(`[serverConfig] 子字段初始化: ${field.path} = ${JSON.stringify(field.value)}`)
      form.setFieldState('log', { value: logs.join('\n') })
    })
  },
}

export default config
