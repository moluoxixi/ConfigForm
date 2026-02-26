import type { ISchema } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'
import { scrollToFirstError } from '@moluoxixi/ui-basic-vue'
import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { ElButton, ElStep, ElSteps } from 'element-plus'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 分步布局容器（Element Plus）
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const current = ref(0)
    const actionLoading = ref(false)

    /**
     * getDataPath?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:38`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param path ?? path ????????????
     * @returns ?????????????
     */
    const /**
           * getDataPath：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
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
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:62`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param schema ?? schema ????????????
     * @param parentPath ?? parentPath ????????????
     * @param output ?? output ????????????
     */
    const /**
           * collectDataPaths：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
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
    const itemPatterns = new Map(items.map((item) => {
      const paths = new Set<string>()
      collectDataPaths(item.schema, basePath, paths)
      return [item.name, Array.from(paths)] as const
    }))

    /**
     * getErrorCount?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:100`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param itemName ?? itemName ????????????
     * @returns ?????????????
     */
    const /**
           * getErrorCount：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @param itemName 参数 itemName 为当前功能所需的输入信息。
           * @returns 返回当前分支执行后的处理结果。
           */
      getErrorCount = (itemName: string): number => {
        const patterns = itemPatterns.get(itemName) ?? []
        if (patterns.length === 0)
          return 0
        return form.errors.filter(e =>
          patterns.some(pattern => FormPath.match(pattern, e.path)),
        ).length
      }

    watch(() => form.errors.length, () => {
      if (form.errors.length === 0)
        return
      const currentItem = items[current.value]
      if (currentItem && getErrorCount(currentItem.name) > 0)
        return

      const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
      if (firstErrorIndex >= 0 && firstErrorIndex !== current.value) {
        current.value = firstErrorIndex
      }
    })

    /**
     * resolveAlign?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:130`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @returns ?????????????
     */
    const /**
           * resolveAlign：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @param value 参数 value 为输入值，用于驱动后续逻辑。
           * @returns 返回当前分支执行后的处理结果。
           */
      resolveAlign = (value?: unknown): string => {
        if (value === 'left')
          return 'flex-start'
        if (value === 'right')
          return 'flex-end'
        return 'center'
      }

    /**
     * resolveLabel?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:147`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @param fallback ?? fallback ????????????
     * @returns ?????????????
     */
    const /**
           * resolveLabel：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @param value 参数 value 为输入值，用于驱动后续逻辑。
           * @param fallback 参数 fallback 为当前功能所需的输入信息。
           * @returns 返回当前分支执行后的处理结果。
           */
      resolveLabel = (value: unknown, fallback: string): string =>
        typeof value === 'string' ? value : fallback

    /**
     * allowAction?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:158`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @returns ?????????????
     */
    const /**
           * allowAction：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @param value 参数 value 为输入值，用于驱动后续逻辑。
           * @returns 返回当前分支执行后的处理结果。
           */
      allowAction = (value: unknown): boolean => value !== false

    /**
     * handleNext?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:166`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleNext：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      handleNext = async (): Promise<void> => {
        if (current.value >= items.length - 1)
          return
        const currentItem = items[current.value]
        if (!currentItem) {
          current.value += 1
          return
        }
        const patterns = itemPatterns.get(currentItem.name) ?? []
        if (patterns.length === 0) {
          current.value += 1
          return
        }
        actionLoading.value = true
        try {
          const result = await form.validateSection(patterns)
          if (result.valid) {
            current.value += 1
          }
          else {
            scrollToFirstError(form.errors)
          }
        }
        finally {
          actionLoading.value = false
        }
      }

    /**
     * handleSubmit?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:200`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleSubmit：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      handleSubmit = async (): Promise<void> => {
        const result = await form.submit()
        if (result.errors.length > 0) {
          scrollToFirstError(result.errors)
        }
      }

    /**
     * handleReset?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutSteps.ts:213`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleReset：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      handleReset = (): void => {
        form.reset()
      }

    return () => {
      const componentProps = (field.componentProps ?? {}) as Record<string, unknown>
      const rawActions = (componentProps.actions ?? {}) as Record<string, unknown>
      const stepOverrides = Array.isArray(rawActions.stepActions)
        ? (rawActions.stepActions[current.value] as Record<string, unknown> | undefined)
        : undefined
      const actions = { ...rawActions, ...(stepOverrides ?? {}) } as Record<string, unknown>

      const renderActions = typeof (actions as { render?: unknown }).render === 'function'
        ? (actions as { render: (ctx: {
            current: number
            total: number
            prev: () => void
            next: () => void
            submit: () => void
            reset: () => void
            form: typeof form
          }) => unknown }).render
        : null

      const customActions = renderActions
        ? renderActions({
            current: current.value,
            total: items.length,
            /**
             * prev：处理当前分支的交互与状态同步。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             */
            prev: () => {
              if (current.value > 0)
                current.value -= 1
            },
            next: handleNext,
            submit: handleSubmit,
            reset: handleReset,
            form,
          })
        : null

      return h('div', null, [
        h(ElSteps, { active: current.value, style: 'margin-bottom: 24px' }, () =>
          items.map(item => h(ElStep, {
            title: item.title,
            status: getErrorCount(item.name) > 0 ? 'error' : undefined,
          }))),
        ...items.map((item, index) =>
          h('div', { key: item.name, style: { display: index === current.value ? 'block' : 'none' } }, h(RecursionField, {
            schema: item.schema,
            basePath,
            onlyRenderProperties: true,
          })),
        ),
        form.pattern === 'editable'
          ? h('div', { style: `margin-top: 16px; display: flex; justify-content: ${resolveAlign(actions.align)}; gap: 8px` }, renderActions
              ? (Array.isArray(customActions) ? customActions : [customActions])
              : [
                  current.value > 0 && allowAction(actions.prev)
                    ? h(ElButton, { /**
                                     * onClick：处理当前分支的交互与状态同步。
                                     * 功能：处理参数消化、状态变更与调用链行为同步。
                                     */
                        /**
                         * onClick：处理当前分支的交互与状态同步。
                         * 功能：处理参数消化、状态变更与调用链行为同步。
                         */
                        onClick: () => { current.value-- },
                      }, () => resolveLabel(actions.prev, '上一步'))
                    : null,
                  current.value < items.length - 1 && allowAction(actions.next)
                    ? h(ElButton, { type: 'primary', loading: actionLoading.value, onClick: handleNext }, () => resolveLabel(actions.next, '下一步'))
                    : null,
                  current.value === items.length - 1 && allowAction(actions.submit)
                    ? h(ElButton, { type: 'primary', loading: actionLoading.value, onClick: handleSubmit }, () => resolveLabel(actions.submit, '提交'))
                    : null,
                  allowAction(actions.reset)
                    ? h(ElButton, { onClick: handleReset }, () => resolveLabel(actions.reset, '重置'))
                    : null,
                ])
          : null,
      ])
    }
  },
})
