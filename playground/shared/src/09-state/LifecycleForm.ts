import type { SceneConfig } from '../types'
import { FormLifeCycle, onFieldInputChange, onFieldMount, onFieldUnmount, onFieldValueChange } from '@moluoxixi/core'

/**
 * 场景：生命周期与 Input 分离
 *
 * 演示 Mount/Unmount 生命周期事件和 onInput/setValue 分离能力：
 * - ON_FORM_MOUNT / ON_FORM_UNMOUNT：表单挂载/卸载
 * - ON_FIELD_MOUNT / ON_FIELD_UNMOUNT：字段挂载/卸载
 * - onInput vs setValue：用户输入触发验证，程序赋值不触发
 * - ON_FIELD_INPUT_VALUE_CHANGE：仅用户输入事件
 *
 * 核心功能覆盖：
 * - mount/unmount 生命周期
 * - onInput/setValue 分离
 * - ON_FIELD_INPUT_VALUE_CHANGE 事件
 * - Effects API（onFieldMount / onFieldUnmount / onFieldInputChange / onFieldValueChange）
 */

const config: SceneConfig = {
  title: '生命周期与 Input 分离',
  description: 'mount/unmount 事件 + onInput vs setValue 区分用户输入和程序赋值',

  initialValues: {
    showOptional: true,
    username: '',
    email: '',
    nickname: '',
    eventLog: '等待交互...',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      showOptional: {
        type: 'boolean',
        title: '显示可选字段',
        description: '切换此开关会触发 nickname 字段的 mount/unmount',
      },
      username: {
        type: 'string',
        title: '用户名',
        required: true,
        description: '在此输入会触发 onFieldInputChange（日志标记为「用户输入」）',
      },
      email: {
        type: 'string',
        title: '邮箱',
        rules: [{ format: 'email' }],
        description: '联动会通过 setValue 赋值（日志标记为「值变化」，不标记「用户输入」）',
        reactions: [{
          watch: ['username'],
          when: '{{$values.username && $values.username.length > 0}}',
          fulfill: { value: '{{$values.username + "@example.com"}}' },
        }],
      },
      nickname: {
        type: 'string',
        title: '昵称（可选字段）',
        description: '此字段受 showOptional 控制显隐，会触发 mount/unmount 事件',
        reactions: [{
          watch: ['showOptional'],
          when: '{{$values.showOptional === true}}',
          fulfill: { state: { display: 'visible' } },
          otherwise: { state: { display: 'none' } },
        }],
      },
      eventLog: {
        type: 'string',
        title: '事件日志',
        component: 'Textarea',
        readOnly: true,
        componentProps: { rows: 10 },
        description: '实时记录生命周期事件和 Input/Value 变化事件',
      },
    },
  },

  effects: (form) => {
    const logs: string[] = []
    const pushLog = (msg: string): void => {
      logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
      form.setFieldState('eventLog', { value: logs.slice(0, 30).join('\n') })
    }

    /* 表单级生命周期 */
    form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
      pushLog('表单挂载 ON_FORM_MOUNT')
    })

    /* 字段挂载/卸载（通配符匹配所有字段） */
    onFieldMount(form, '*', (field) => {
      pushLog(`字段挂载 [${field.path}] mounted=${String(field.mounted)}`)
    })
    onFieldUnmount(form, '*', (field) => {
      pushLog(`字段卸载 [${field.path}] mounted=${String(field.mounted)}`)
    })

    /**
     * onFieldInputChange：仅用户输入
     * 只有用户在 UI 上手动输入时触发，联动赋值（setValue）不触发。
     */
    onFieldInputChange(form, 'username', (field) => {
      pushLog(`用户输入 [${field.path}] = "${String(field.value)}"`)
    })
    onFieldInputChange(form, 'nickname', (field) => {
      pushLog(`用户输入 [${field.path}] = "${String(field.value)}"`)
    })

    /**
     * onFieldValueChange：所有值变化（含程序赋值）
     * 联动赋值 email 时也会触发（但不会标记为「用户输入」）。
     */
    onFieldValueChange(form, 'email', (field) => {
      pushLog(`值变化 [${field.path}] = "${String(field.value)}"（可能是联动赋值）`)
    })

    onFieldValueChange(form, 'showOptional', (field) => {
      pushLog(`值变化 [showOptional] = ${String(field.value)}`)
    })
  },
}

export default config
