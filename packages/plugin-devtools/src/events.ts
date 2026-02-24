import type { DevToolsActionEventType } from './types'
import { FormLifeCycle } from '@moluoxixi/core'

/** 生命周期事件定义（表单级） */
export interface DevToolsFormEventDefinition {
  type: FormLifeCycle
  label: string
}

/** 生命周期事件定义（字段级） */
export interface DevToolsFieldEventDefinition {
  type:
    | FormLifeCycle.ON_FIELD_INIT
    | FormLifeCycle.ON_FIELD_MOUNT
    | FormLifeCycle.ON_FIELD_UNMOUNT
    | FormLifeCycle.ON_FIELD_VALUE_CHANGE
    | FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE
  label: string
}

/** DevTools 自定义事件标签 */
export const DEVTOOLS_ACTION_EVENT_LABELS: Record<DevToolsActionEventType, string> = {
  'devtools:init': 'DevTools 初始化',
  'devtools:locate': '字段定位',
  'devtools:locate-miss': '字段定位失败',
  'devtools:setValue': '手动赋值',
  'devtools:setState': '修改字段状态',
  'devtools:validate': '手动验证',
  'devtools:reset': '手动重置',
  'devtools:submit': '手动提交',
}

/** 插件监听的表单生命周期事件 */
export const DEVTOOLS_FORM_EVENT_DEFINITIONS: readonly DevToolsFormEventDefinition[] = [
  { type: FormLifeCycle.ON_FORM_INIT, label: '表单初始化' },
  { type: FormLifeCycle.ON_FORM_MOUNT, label: '表单挂载' },
  { type: FormLifeCycle.ON_FORM_UNMOUNT, label: '表单卸载' },
  { type: FormLifeCycle.ON_FORM_VALUES_CHANGE, label: '值变化' },
  { type: FormLifeCycle.ON_FORM_SUBMIT_START, label: '提交开始' },
  { type: FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, label: '提交成功' },
  { type: FormLifeCycle.ON_FORM_SUBMIT_FAILED, label: '提交失败' },
  { type: FormLifeCycle.ON_FORM_SUBMIT_END, label: '提交结束' },
  { type: FormLifeCycle.ON_FORM_RESET, label: '表单重置' },
  { type: FormLifeCycle.ON_FORM_VALIDATE_START, label: '验证开始' },
  { type: FormLifeCycle.ON_FORM_VALIDATE_SUCCESS, label: '验证通过' },
  { type: FormLifeCycle.ON_FORM_VALIDATE_FAILED, label: '验证失败' },
] as const

/** 插件监听的字段生命周期事件 */
export const DEVTOOLS_FIELD_EVENT_DEFINITIONS: readonly DevToolsFieldEventDefinition[] = [
  { type: FormLifeCycle.ON_FIELD_INIT, label: '字段创建' },
  { type: FormLifeCycle.ON_FIELD_MOUNT, label: '字段挂载' },
  { type: FormLifeCycle.ON_FIELD_UNMOUNT, label: '字段卸载' },
  { type: FormLifeCycle.ON_FIELD_VALUE_CHANGE, label: '值变化' },
  { type: FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE, label: '用户输入' },
] as const

/**
 * 构建字段事件摘要文本
 * @param event 参数 `event`用于传递事件上下文，使逻辑能基于交互状态进行处理。
 * @param field 参数 `field`用于提供当前函数执行所需的输入信息。
 * @param field.path 字段路径，用于输出事件定位信息。
 * @param field.value 字段当前值，用于输出变更摘要。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
export function buildDevToolsFieldEventSummary(
  event: DevToolsFieldEventDefinition['type'],
  field: { path: string, value: unknown },
): string {
  switch (event) {
    case FormLifeCycle.ON_FIELD_INIT:
      return `字段创建: ${field.path}`
    case FormLifeCycle.ON_FIELD_MOUNT:
      return `字段挂载: ${field.path}`
    case FormLifeCycle.ON_FIELD_UNMOUNT:
      return `字段卸载: ${field.path}`
    case FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE:
      return `用户输入: ${field.path}`
    case FormLifeCycle.ON_FIELD_VALUE_CHANGE:
    default:
      return `值变化: ${field.path} = ${JSON.stringify(field.value)?.slice(0, 50)}`
  }
}
