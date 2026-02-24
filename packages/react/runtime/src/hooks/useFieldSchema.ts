import type { ISchema } from '@moluoxixi/core'
import { useContext } from 'react'
import { SchemaContext } from '../context'

/**
 * useFieldSchema：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */

export function useFieldSchema(): ISchema {
  const schema = useContext(SchemaContext)
  if (!schema) {
    throw new Error('[ConfigForm] useFieldSchema 必须在 SchemaField 渲染的组件内使用')
  }
  return schema
}
