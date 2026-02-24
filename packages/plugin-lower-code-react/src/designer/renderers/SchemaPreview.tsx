import type { ISchema } from '@moluoxixi/core'
import type React from 'react'
import type { RegistrySnapshot } from './registry-shared'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
import { mapToRecord } from './registry-shared'

/**
 * Schema Preview Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/SchemaPreview.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface SchemaPreviewProps {
  schema: ISchema
  registry: RegistrySnapshot
  initialValues?: Record<string, unknown>
  className?: string
}

/**
 * Schema Preview：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/SchemaPreview.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.schema 当前表单 Schema。
 * @param param1.registry 组件注册表快照。
 * @param param1.initialValues 表单初始值。
 * @param param1.className 预览容器类名。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
