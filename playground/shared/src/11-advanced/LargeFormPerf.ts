import type { ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：大表单性能
 *
 * 演示大量字段（50/100/200 个）的渲染性能。
 * Schema 和 Fields 均为动态生成，按 4 种类型循环：InputNumber / Switch / DatePicker / Input。
 * 每 10 个字段有 1 个必填字段。
 */

/** 默认字段数量 */
const DEFAULT_FIELD_COUNT = 50

/**
 * 动态生成 schema properties
 *
 * @param count - 字段数量
 * @returns schema properties 对象
 */
function generateSchemaProperties(count: number): Record<string, ISchema> {
  const properties: Record<string, ISchema> = {}
  for (let i = 0; i < count; i++) {
    const type = i % 4 === 0 ? 'number' : i % 4 === 1 ? 'boolean' : i % 4 === 2 ? 'date' : 'string'
    properties[`field_${i}`] = {
      type,
      title: `字段 ${i + 1}`,
      default: type === 'number' ? 0 : type === 'boolean' ? false : '',
      ...(i % 10 === 0 ? { required: true } : {}),
    }
  }
  return properties
}

/**
 * 动态生成初始值
 *
 * @param count - 字段数量
 * @returns 初始值对象
 */
function generateInitialValues(count: number): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (let i = 0; i < count; i++) {
    const type = i % 4
    values[`field_${i}`] = type === 0 ? 0 : type === 1 ? false : ''
  }
  return values
}

/**
 * 动态生成 fields 配置
 *
 * @param count - 字段数量
 * @returns fields 数组
 */
function generateFields(count: number): Array<{ name: string, label: string, component: string, required?: boolean }> {
  const fields: Array<{ name: string, label: string, component: string, required?: boolean }> = []
  for (let i = 0; i < count; i++) {
    const component = i % 4 === 0 ? 'InputNumber' : i % 4 === 1 ? 'Switch' : i % 4 === 2 ? 'DatePicker' : 'Input'
    fields.push({
      name: `field_${i}`,
      label: `字段 ${i + 1}`,
      component,
      ...(i % 10 === 0 ? { required: true } : {}),
    })
  }
  return fields
}

const config: SceneConfig & {
  generateSchemaProperties: typeof generateSchemaProperties
  generateInitialValues: typeof generateInitialValues
  generateFields: typeof generateFields
  defaultFieldCount: number
} = {
  title: '大表单性能',
  description: `${DEFAULT_FIELD_COUNT} 个字段性能测试 — 批量渲染，支持切换 50/100/200 个字段`,

  initialValues: generateInitialValues(DEFAULT_FIELD_COUNT),

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'left', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: generateSchemaProperties(DEFAULT_FIELD_COUNT),
  },

  fields: generateFields(DEFAULT_FIELD_COUNT),

  /** 动态生成 schema properties（供实现侧使用） */
  generateSchemaProperties,
  /** 动态生成初始值（供实现侧使用） */
  generateInitialValues,
  /** 动态生成 fields 配置（供实现侧使用） */
  generateFields,
  /** 默认字段数量 */
  defaultFieldCount: DEFAULT_FIELD_COUNT,
}

export default config
