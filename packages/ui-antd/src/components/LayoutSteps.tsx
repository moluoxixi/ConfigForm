import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { FormPath } from '@moluoxixi/core'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'

import { Steps as ASteps, Button } from 'antd'
import { useEffect, useMemo, useState } from 'react'

/**
 * LayoutStepsProps??????
 * ???`packages/ui-antd/src/components/LayoutSteps.tsx:9`?
 * ??????????????????????????????
 */
export interface LayoutStepsProps {}

/**
 * 分步布局容器
 *
 * 使用框架层 useSchemaItems() 发现步骤面板，
 * 一次只显示当前步骤，自动渲染上一步/下一步按钮。
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = observer((_props: LayoutStepsProps): ReactElement => {
  const field = useField()
  const form = useForm()
  const items = useSchemaItems()
  const [current, setCurrent] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  /**
   * getDataPath?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:36`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param path ?? path ????????????
   * @returns ?????????????
   */
  const /**
         * getDataPath：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:28`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param path 参数 path 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
    getDataPath = (path: string): string => {
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

  /**
   * collectDataPaths?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:60`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param schema ?? schema ????????????
   * @param parentPath ?? parentPath ????????????
   * @param output ?? output ????????????
   */
  const /**
         * collectDataPaths：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:43`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param schema 参数 schema 为当前功能所需的输入信息。
         * @param parentPath 参数 parentPath 为当前功能所需的输入信息。
         * @param output 参数 output 为当前功能所需的输入信息。
         */
    collectDataPaths = (schema: ISchema, parentPath: string, output: Set<string>): void => {
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
  })), [items, basePath])

  /** 统计某个步骤下的验证错误数量 */
  const getErrorCount = (itemName: string): number => {
    const patterns = itemPatterns.get(itemName) ?? []
    if (patterns.length === 0)
      return 0
    return form.errors.filter(e =>
      patterns.some(pattern => FormPath.match(pattern, e.path)),
    ).length
  }

  /** 提交失败时自动跳转到第一个有错误的步骤 */
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
  }, [form.errors.length])

  const componentProps = (field.componentProps ?? {}) as Record<string, unknown>
  const rawActions = (componentProps.actions ?? {}) as Record<string, unknown>
  const stepOverrides = Array.isArray(rawActions.stepActions)
    ? (rawActions.stepActions[current] as Record<string, unknown> | undefined)
    : undefined
  const actions = { ...rawActions, ...(stepOverrides ?? {}) } as Record<string, unknown>

  /**
   * resolveAlign?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:130`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param value ?? value ????????????
   * @returns ?????????????
   */
  const /**
         * resolveAlign：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:105`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param value 参数 value 为输入值，用于驱动后续逻辑。
         * @returns 返回当前分支执行后的处理结果。
         */
    resolveAlign = (value?: unknown): 'flex-start' | 'center' | 'flex-end' => {
      if (value === 'left')
        return 'flex-start'
      if (value === 'right')
        return 'flex-end'
      return 'center'
    }

  /**
   * resolveLabel?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:147`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param value ?? value ????????????
   * @param fallback ?? fallback ????????????
   * @returns ?????????????
   */
  const /**
         * resolveLabel：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:113`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param value 参数 value 为输入值，用于驱动后续逻辑。
         * @param fallback 参数 fallback 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
    resolveLabel = (value: unknown, fallback: string): string =>
      typeof value === 'string' ? value : fallback

  /**
   * allowAction?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:158`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param value ?? value ????????????
   * @returns ?????????????
   */
  const /**
         * allowAction：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:116`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param value 参数 value 为输入值，用于驱动后续逻辑。
         * @returns 返回当前分支执行后的处理结果。
         */
    allowAction = (value: unknown): boolean => value !== false

  /**
   * handleNext?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:166`?
   * ?????????????????????????????????
   * ??????????????????????????
   */
  const /**
         * handleNext：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:118`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
    handleNext = async (): Promise<void> => {
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
          form.scrollToFirstError()
        }
      }
      finally {
        setActionLoading(false)
      }
    }

  /**
   * handleSubmit?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:200`?
   * ?????????????????????????????????
   * ??????????????????????????
   */
  const /**
         * handleSubmit：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:146`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
    handleSubmit = async (): Promise<void> => {
      const result = await form.submit()
      if (result.errors.length > 0) {
        form.scrollToFirstError()
      }
    }

  /**
   * handleReset?????????????????
   * ???`packages/ui-antd/src/components/LayoutSteps.tsx:213`?
   * ?????????????????????????????????
   * ??????????????????????????
   */
  const /**
         * handleReset：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:153`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
    handleReset = (): void => {
      form.reset()
    }

  const renderActions = typeof (actions as { render?: unknown }).render === 'function'
    ? (actions as { render: (ctx: {
        current: number
        total: number
        prev: () => void
        next: () => void
        submit: () => void
        reset: () => void
        form: typeof form
      }) => React.ReactNode }).render
    : null

  const actionContent = renderActions
    ? renderActions({
        current,
        total: items.length,
        /**
         * prev：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutSteps.tsx:173`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
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
