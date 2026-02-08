import { RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 43：撤销重做
 *
 * 覆盖：
 * - undo / redo 操作
 * - 历史记录栈
 * - 键盘快捷键（Ctrl+Z / Ctrl+Shift+Z）
 * - 三种模式切换
 *
 * 所有字段使用 FormField + fieldProps。撤销/重做工具栏作为附加内容。
 * 通过 form.onValuesChange 监听值变化，维护操作栈支持 undo/redo。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'

setupAntd()

/** 历史记录最大长度 */
const MAX_HISTORY = 50

/** 初始表单值 */
const INITIAL_VALUES = { title: '', category: '', amount: 0, note: '' }

export const UndoRedoForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  /** 历史记录栈 */
  const historyRef = useRef<Array<Record<string, unknown>>>([{ ...INITIAL_VALUES }])
  const indexRef = useRef(0)
  const isRestoringRef = useRef(false)
  const [historyLen, setHistoryLen] = useState(1)
  const [currentIdx, setCurrentIdx] = useState(0)

  /** 记录历史 */
  const pushHistory = useCallback((values: Record<string, unknown>): void => {
    if (isRestoringRef.current) return
    const history = historyRef.current
    /* 截断 redo 部分 */
    historyRef.current = history.slice(0, indexRef.current + 1)
    historyRef.current.push({ ...values })
    if (historyRef.current.length > MAX_HISTORY)
      historyRef.current.shift()
    indexRef.current = historyRef.current.length - 1
    setHistoryLen(historyRef.current.length)
    setCurrentIdx(indexRef.current)
  }, [])

  /** 监听值变化：记录到历史栈 */
  useEffect(() => {
    const unsub = form.onValuesChange((values: Record<string, unknown>) => {
      pushHistory(values)
    })
    return unsub
  }, [form, pushHistory])

  /** 撤销：回退到上一个历史快照 */
  const undo = useCallback((): void => {
    if (indexRef.current <= 0) return
    indexRef.current -= 1
    isRestoringRef.current = true
    form.setValues(historyRef.current[indexRef.current])
    isRestoringRef.current = false
    setCurrentIdx(indexRef.current)
  }, [form])

  /** 重做：前进到下一个历史快照 */
  const redo = useCallback((): void => {
    if (indexRef.current >= historyRef.current.length - 1) return
    indexRef.current += 1
    isRestoringRef.current = true
    form.setValues(historyRef.current[indexRef.current])
    isRestoringRef.current = false
    setCurrentIdx(indexRef.current)
  }, [form])

  /** 全局键盘快捷键 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const canUndo = currentIdx > 0
  const canRedo = currentIdx < historyLen - 1

  return (
    <div>
      <h3>撤销重做</h3>
      <p style={{ color: '#666' }}>undo / redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</p>

      {/* 撤销/重做工具栏（附加内容） */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <button type="button" disabled={!canUndo} onClick={undo} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.5 }}>
          <UndoOutlined />
          撤销 (Ctrl+Z)
        </button>
        <button type="button" disabled={!canRedo} onClick={redo} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 6, border: '1px solid #d9d9d9', background: '#fff', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.5 }}>
          <RedoOutlined />
          重做 (Ctrl+Shift+Z)
        </button>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
          历史记录：
          {currentIdx + 1}
          {' '}
          /
          {historyLen}
        </span>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input' }} />
                <FormField name="category" fieldProps={{ label: '分类', component: 'Input' }} />
                <FormField name="amount" fieldProps={{ label: '金额', component: 'InputNumber', componentProps: { style: { width: '100%' } } }} />
                <FormField name="note" fieldProps={{ label: '备注', component: 'Textarea', componentProps: { rows: 3 } }} />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
