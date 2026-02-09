import type { SceneConfig } from '../types'
import { onFieldInputChange, onFieldMount, onFieldValueChange, onFormReact } from '@moluoxixi/core'

/**
 * 场景：Effects API 命令式用法
 *
 * 演示命令式 Effects hooks 作为声明式 reactions 的补充：
 * - onFieldValueChange：模式匹配监听字段值变化
 * - onFieldInputChange：仅监听用户输入（区分程序赋值）
 * - onFieldMount：监听字段挂载到 DOM
 * - onFormReact：响应式自动追踪依赖
 *
 * 核心功能覆盖：
 * - Effects API（onFieldValueChange / onFieldInputChange / onFieldMount / onFormReact）
 * - onInput/setValue 分离（onFieldInputChange 仅响应用户输入）
 * - mount 生命周期（onFieldMount）
 */

const config: SceneConfig = {
  title: 'Effects API 命令式联动',
  description: 'onFieldValueChange / onFieldInputChange / onFormReact — 命令式 Effects',

  initialValues: {
    firstName: '张',
    lastName: '三',
    fullName: '张 三',
    price: 100,
    quantity: 2,
    total: 200,
    log: '等待交互...',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      firstName: { type: 'string', title: '姓' },
      lastName: { type: 'string', title: '名' },
      fullName: {
        type: 'string',
        title: '全名（自动计算）',
        readOnly: true,
        description: '由 onFormReact 自动追踪 firstName + lastName 计算',
      },
      price: { type: 'number', title: '单价', componentProps: { min: 0, style: 'width: 100%' } },
      quantity: { type: 'number', title: '数量', componentProps: { min: 1, style: 'width: 100%' } },
      total: {
        type: 'number',
        title: '总价（自动计算）',
        readOnly: true,
        description: '由 onFieldValueChange 监听 price/quantity 计算',
      },
      log: {
        type: 'string',
        title: '事件日志',
        component: 'Textarea',
        readOnly: true,
        componentProps: { rows: 5 },
        description: '记录 effects 触发的事件（含 onFieldInputChange / onFieldMount）',
      },
    },
  },

  effects: (form) => {
    const logs: string[] = []
    const pushLog = (msg: string): void => {
      logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
      form.setFieldState('log', { value: logs.slice(0, 20).join('\n') })
    }

    /**
     * onFormReact：响应式自动追踪
     * 访问 form.values.firstName 和 form.values.lastName 时自动建立依赖，
     * 任一变化时自动重新计算 fullName。
     */
    onFormReact(form, (f) => {
      const first = (f.values as Record<string, unknown>).firstName ?? ''
      const last = (f.values as Record<string, unknown>).lastName ?? ''
      f.setFieldState('fullName', { value: `${first} ${last}`.trim() })
    })

    /**
     * onFieldValueChange：模式匹配监听
     * 通配符 price 和 quantity 任一变化时重新计算 total。
     * 响应所有来源（用户输入 + 程序赋值）。
     */
    onFieldValueChange(form, 'price', (field) => {
      const values = form.values as Record<string, unknown>
      const total = (Number(values.price) || 0) * (Number(values.quantity) || 0)
      form.setFieldState('total', { value: total })
      pushLog(`值变化 [${field.path}] = ${String(field.value)}，total → ${total}`)
    })
    onFieldValueChange(form, 'quantity', (field) => {
      const values = form.values as Record<string, unknown>
      const total = (Number(values.price) || 0) * (Number(values.quantity) || 0)
      form.setFieldState('total', { value: total })
      pushLog(`值变化 [${field.path}] = ${String(field.value)}，total → ${total}`)
    })

    /**
     * onFieldInputChange：仅用户输入
     * 只有用户在 UI 上手动输入才触发，程序调用 setValue 不触发。
     * 用于区分"用户输入"和"联动赋值"。
     */
    onFieldInputChange(form, 'firstName', (field) => {
      pushLog(`用户输入 [${field.path}] = "${String(field.value)}"（仅 onInput 触发）`)
    })
    onFieldInputChange(form, 'lastName', (field) => {
      pushLog(`用户输入 [${field.path}] = "${String(field.value)}"（仅 onInput 触发）`)
    })

    /**
     * onFieldMount：字段挂载
     * 字段渲染到 DOM 后触发，用于初始化逻辑。
     */
    onFieldMount(form, '*', (field) => {
      pushLog(`字段挂载 [${field.path}]`)
    })
  },
}

export default config
