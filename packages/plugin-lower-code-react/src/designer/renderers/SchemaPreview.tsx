import type { ISchema } from '@moluoxixi/core'
import type React from 'react'
import type { RegistrySnapshot } from './registry-shared'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
import { mapToRecord } from './registry-shared'

interface SchemaPreviewProps {
  schema: ISchema
  registry: RegistrySnapshot
  initialValues?: Record<string, unknown>
  className?: string
}

/**
 * Schema Preview：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Schema Preview 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function SchemaPreview({
  schema,
  registry,
  initialValues,
  className = 'cf-lc-real-preview-wrap cf-lc-real-preview-wrap--container',
}: SchemaPreviewProps): React.ReactElement {
  const components = useMemo(() => mapToRecord(registry.components), [registry.components])
  const decorators = useMemo(() => mapToRecord(registry.decorators), [registry.decorators])
  const actions = useMemo(() => mapToRecord(registry.actions), [registry.actions])
  const defaultDecorators = useMemo(() => mapToRecord(registry.defaultDecorators), [registry.defaultDecorators])
  const readPrettyComponents = useMemo(() => mapToRecord(registry.readPrettyComponents), [registry.readPrettyComponents])

  return (
    <div className={className}>
      <ConfigForm
        schema={schema}
        initialValues={initialValues}
        components={components}
        decorators={decorators}
        actions={actions}
        defaultDecorators={defaultDecorators}
        readPrettyComponents={readPrettyComponents}
      />
    </div>
  )
}
