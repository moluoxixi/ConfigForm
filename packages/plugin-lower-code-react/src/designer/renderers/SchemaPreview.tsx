import type { ISchema } from '@moluoxixi/core'
import type React from 'react'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
import type { RegistrySnapshot } from './registry-shared'
import { mapToRecord } from './registry-shared'

interface SchemaPreviewProps {
  schema: ISchema
  registry: RegistrySnapshot
  initialValues?: Record<string, unknown>
  className?: string
}

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
