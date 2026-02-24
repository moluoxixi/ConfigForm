import type { ISchema } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'
import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { Button as AButton, Step as AStep, Steps as ASteps } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 分步布局容器（Ant Design Vue）
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:16`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:38`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param path ?? path ????????????
     * @returns ?????????????
     */
    const /**
           * getDataPath：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:23`。
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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:62`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param schema ?? schema ????????????
     * @param parentPath ?? parentPath ????????????
     * @param output ?? output ????????????
     */
    const /**
           * collectDataPaths：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:38`。
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
    const itemPatterns = new Map(items.map((item) => {
      const paths = new Set<string>()
      collectDataPaths(item.schema, basePath, paths)
      return [item.name, Array.from(paths)] as const
    }))

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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:124`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @returns ?????????????
     */
    const /**
           * resolveAlign：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:92`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:141`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @param fallback ?? fallback ????????????
     * @returns ?????????????
     */
    const /**
           * resolveLabel：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:100`。
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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:152`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param value ?? value ????????????
     * @returns ?????????????
     */
    const /**
           * allowAction：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:103`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @param value 参数 value 为输入值，用于驱动后续逻辑。
           * @returns 返回当前分支执行后的处理结果。
           */
      allowAction = (value: unknown): boolean => value !== false

    /**
     * handleNext?????????????????
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:160`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleNext：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:105`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
            form.scrollToFirstError()
          }
        }
        finally {
          actionLoading.value = false
        }
      }

    /**
     * handleSubmit?????????????????
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:194`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleSubmit：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:133`。
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
     * ???`packages/ui-antd-vue/src/components/LayoutSteps.ts:207`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleReset：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:140`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
             * prev：执行当前位置的功能逻辑。
             * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:168`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
        h(ASteps, { current: current.value, style: 'margin-bottom: 24px' }, () =>
          items.map(item => h(AStep, {
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
                    ? h(AButton, { /**
                                    * onClick：执行当前位置的功能逻辑。
                                    * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:197`。
                                    * 功能：处理参数消化、状态变更与调用链行为同步。
                                    * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                    */
                        /**
                         * onClick：执行当前位置的功能逻辑。
                         * 定位：`packages/ui-antd-vue/src/components/LayoutSteps.ts:276`。
                         * 功能：处理参数消化、状态变更与调用链行为同步。
                         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                         */
                        onClick: () => { current.value-- },
                      }, () => resolveLabel(actions.prev, '上一步'))
                    : null,
                  current.value < items.length - 1 && allowAction(actions.next)
                    ? h(AButton, { type: 'primary', loading: actionLoading.value, onClick: handleNext }, () => resolveLabel(actions.next, '下一步'))
                    : null,
                  current.value === items.length - 1 && allowAction(actions.submit)
                    ? h(AButton, { type: 'primary', loading: actionLoading.value, onClick: handleSubmit }, () => resolveLabel(actions.submit, '提交'))
                    : null,
                  allowAction(actions.reset)
                    ? h(AButton, { onClick: handleReset }, () => resolveLabel(actions.reset, '重置'))
                    : null,
                ])
          : null,
      ])
    }
  },
})
