import type { ISchema } from '@moluoxixi/core'
import type { ReactElement, ReactNode } from 'react'
import { FormPath } from '@moluoxixi/core'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'
import { scrollToFirstError } from '@moluoxixi/ui-basic-react'
import { Button, Steps as ASteps } from 'antd'
import { useEffect, useMemo, useState } from 'react'

export interface LayoutStepsProps {}

export const LayoutSteps = observer((_props: LayoutStepsProps): ReactElement => {
  const field = useField()
  const form = useForm()
  const items = useSchemaItems()
  const [current, setCurrent] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  const getDataPath = (path: string): string => {
    if (!path)
      return ''
    const segments = path.split('.')
    const dataSegments: string[] = []
    let currentPath = ''
    for (const seg of segments) {
      currentPath = currentPath ? `${currentPath}.${seg}` : seg
      if (form.getAllVoidFields().has(currentPath))
        continue
      dataSegments.push(seg)
    }
    return dataSegments.join('.')
  }

  const collectDataPaths = (schema: ISchema, parentPath: string, output: Set<string>): void => {
    if (!schema.properties)
      return
    for (const [name, childSchema] of Object.entries(schema.properties)) {
      if (childSchema.type === 'void') {
        collectDataPaths(childSchema, parentPath, output)
        continue
      }
      const nextPath = parentPath ? `${parentPath}.${name}` : name
      output.add(nextPath)
      if (childSchema.properties)
        collectDataPaths(childSchema, nextPath, output)
      if (childSchema.items) {
        const itemPath = `${nextPath}.*`
        output.add(itemPath)
        collectDataPaths(childSchema.items, itemPath, output)
      }
    }
  }

  const basePath = getDataPath(field.path)
  const itemPatterns = useMemo(() => new Map(items.map((item) => {
    const paths = new Set<string>()
    collectDataPaths(item.schema, basePath, paths)
    return [item.name, Array.from(paths)] as const
  })), [basePath, items])

  const getErrorCount = (itemName: string): number => {
    const patterns = itemPatterns.get(itemName) ?? []
    if (patterns.length === 0)
      return 0
    return form.errors.filter(e => patterns.some(pattern => FormPath.match(pattern, e.path))).length
  }

  useEffect(() => {
    if (form.errors.length === 0)
      return
    const currentItem = items[current]
    if (currentItem && getErrorCount(currentItem.name) > 0)
      return
    const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
    if (firstErrorIndex >= 0 && firstErrorIndex !== current) {
      setCurrent(firstErrorIndex)
    }
  }, [current, form.errors.length, items, itemPatterns])

  const componentProps = (field.componentProps ?? {}) as Record<string, unknown>
  const rawActions = (componentProps.actions ?? {}) as Record<string, unknown>
  const stepOverrides = Array.isArray(rawActions.stepActions)
    ? (rawActions.stepActions[current] as Record<string, unknown> | undefined)
    : undefined
  const actions = { ...rawActions, ...(stepOverrides ?? {}) } as Record<string, unknown>

  const resolveAlign = (value?: unknown): 'flex-start' | 'center' | 'flex-end' => {
    if (value === 'left')
      return 'flex-start'
    if (value === 'right')
      return 'flex-end'
    return 'center'
  }

  const resolveLabel = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback

  const allowAction = (value: unknown): boolean => value !== false

  const handleNext = async (): Promise<void> => {
    if (current >= items.length - 1)
      return
    const currentItem = items[current]
    if (!currentItem) {
      setCurrent(current + 1)
      return
    }
    const patterns = itemPatterns.get(currentItem.name) ?? []
    if (patterns.length === 0) {
      setCurrent(current + 1)
      return
    }
    setActionLoading(true)
    try {
      const result = await form.validateSection(patterns)
      if (result.valid) {
        setCurrent(current + 1)
      }
      else {
        scrollToFirstError(form.errors)
      }
    }
    finally {
      setActionLoading(false)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    const result = await form.submit()
    if (result.errors.length > 0) {
      scrollToFirstError(result.errors)
    }
  }

  const handleReset = (): void => {
    form.reset()
  }

  const renderActions = typeof (actions as { render?: unknown }).render === 'function'
    ? (actions as {
        render: (ctx: {
          current: number
          total: number
          prev: () => void
          next: () => void
          submit: () => void
          reset: () => void
          form: typeof form
        }) => ReactNode
      }).render
    : null

  const actionContent = renderActions
    ? renderActions({
        current,
        total: items.length,
        prev: () => setCurrent(current - 1),
        next: handleNext,
        submit: handleSubmit,
        reset: handleReset,
        form,
      })
    : null

  return (
    <div>
      <ASteps
        current={current}
        items={items.map(item => ({
          title: item.title,
          status: getErrorCount(item.name) > 0 ? 'error' as const : undefined,
        }))}
        style={{ marginBottom: 24 }}
      />
      <div>
        {items.map((item, index) => (
          <div key={item.name} style={{ display: index === current ? 'block' : 'none' }}>
            <RecursionField
              schema={item.schema}
              basePath={basePath}
              onlyRenderProperties
            />
          </div>
        ))}
      </div>
      {form.pattern === 'editable' && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: resolveAlign(actions.align), gap: 8 }}>
          {renderActions
            ? actionContent
            : (
                <>
                  {current > 0 && allowAction(actions.prev) && (
                    <Button onClick={() => setCurrent(current - 1)}>
                      {resolveLabel(actions.prev, '上一步')}
                    </Button>
                  )}
                  {current < items.length - 1 && allowAction(actions.next) && (
                    <Button type="primary" loading={actionLoading} onClick={handleNext}>
                      {resolveLabel(actions.next, '下一步')}
                    </Button>
                  )}
                  {current === items.length - 1 && allowAction(actions.submit) && (
                    <Button type="primary" loading={actionLoading} onClick={handleSubmit}>
                      {resolveLabel(actions.submit, '提交')}
                    </Button>
                  )}
                  {allowAction(actions.reset) && (
                    <Button onClick={handleReset}>
                      {resolveLabel(actions.reset, '重置')}
                    </Button>
                  )}
                </>
              )}
        </div>
      )}
    </div>
  )
})
