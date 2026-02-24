import { ComponentRegistryContext, FormContext } from '@moluoxixi/react'
import { Button as AButton } from 'antd'
import React, { useCallback, useContext } from 'react'

/**
 * Layout Form Actions Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/LayoutFormActions.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LayoutFormActionsProps {
  showSubmit?: boolean
  showReset?: boolean
  submitLabel?: string
  resetLabel?: string
  align?: 'left' | 'center' | 'right'
  extraActions?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onSubmitFailed?: (errors: unknown[]) => void
  onReset?: () => void
}

/**
 * 表单操作按钮（提交 + 重置）
 *
 * 参考 Formily Submit/Reset 组件。
 * 自动从 FormContext 获取 form 实例，直接调用 form.submit() / form.reset()。
 * 无需外层包裹 <form> 标签。
 * @param param1 原始解构参数（{
  showSubmit = true,
  showReset = true,
  submitLabel = '提交',
  resetLabel = '重置',
  align = 'center',
  extraActions = {},
  onSubmit,
  onSubmitFailed,
  onReset,
}）用于提供当前函数执行所需的输入信息。
 * @param param1.showSubmit 是否显示提交按钮。
 * @param param1.showReset 是否显示重置按钮。
 * @param param1.submitLabel 提交按钮文案。
 * @param param1.resetLabel 重置按钮文案。
 * @param param1.align 按钮区对齐方式。
 * @param param1.extraActions 额外动作按钮配置。
 * @param param1.onSubmit 提交成功回调。
 * @param param1.onSubmitFailed 提交失败回调。
 * @param param1.onReset 重置回调。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function LayoutFormActions({
  showSubmit = true,
  showReset = true,
  submitLabel = '提交',
  resetLabel = '重置',
  align = 'center',
  extraActions = {},
  onSubmit,
  onSubmitFailed,
  onReset,
}: LayoutFormActionsProps): React.ReactElement {
  const form = useContext(FormContext)
  const registry = useContext(ComponentRegistryContext)

  const handleSubmit = useCallback(async () => {
    if (!form)
      return
    const result = await form.submit()
    if (result.errors.length > 0) {
      onSubmitFailed?.(result.errors)
    }
    else {
      onSubmit?.(result.values)
    }
  }, [form, onSubmit, onSubmitFailed])

  const handleReset = useCallback(() => {
    form?.reset()
    onReset?.()
  }, [form, onReset])

  /** preview/disabled 模式下自动隐藏操作按钮 */
  if (form && form.pattern !== 'editable') {
    return <></>
  }

  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
  const extraActionNodes = Object.entries(extraActions)
    .filter(([, config]) => config !== false)
    .map(([actionName, config]) => {
      const ActionComp = registry.actions.get(actionName)
      if (!ActionComp) {
        return null
      }
      const resolvedProps = typeof config === 'string'
        ? { buttonText: config }
        : (typeof config === 'object' && config !== null && !Array.isArray(config) ? config : {})
      return <ActionComp key={actionName} {...resolvedProps} />
    })

  return (
    <div style={{ marginTop: 24, display: 'flex', justifyContent, gap: 8 }}>
      {showSubmit && <AButton type="primary" onClick={handleSubmit}>{submitLabel}</AButton>}
      {showReset && <AButton onClick={handleReset}>{resetLabel}</AButton>}
      {extraActionNodes}
    </div>
  )
}
