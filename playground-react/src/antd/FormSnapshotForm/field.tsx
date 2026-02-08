import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 42：表单快照
 *
 * 覆盖：
 * - 暂存草稿（localStorage）
 * - 恢复草稿
 * - 多版本草稿列表
 * - 三种模式切换
 */
import React, { useState } from 'react'

setupAntd()

/** localStorage 存储键 */
const STORAGE_KEY = 'configform-snapshot-drafts'

/** 最大草稿数量 */
const MAX_DRAFTS = 10

/** 草稿数据结构 */
interface DraftItem {
  id: string
  timestamp: number
  label: string
  values: Record<string, unknown>
}

/** 读取草稿列表 */
function loadDrafts(): DraftItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  }
  catch { return [] }
}

/** 保存草稿列表到 localStorage */
function saveDraftsToStorage(drafts: DraftItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export const FormSnapshotForm = observer((): React.ReactElement => {
  const [drafts, setDrafts] = useState<DraftItem[]>(loadDrafts)

  const form = useCreateForm({
    initialValues: { title: '', description: '', category: '', priority: '' },
  })

  /** 暂存草稿 */
  const saveDraft = (): void => {
    const values = { ...form.values } as Record<string, unknown>
    const draft: DraftItem = {
      id: String(Date.now()),
      timestamp: Date.now(),
      label: (values.title as string) || '未命名草稿',
      values,
    }
    const newDrafts = [draft, ...drafts].slice(0, MAX_DRAFTS)
    setDrafts(newDrafts)
    saveDraftsToStorage(newDrafts)
    alert('草稿已暂存')
  }

  /** 恢复草稿 */
  const restoreDraft = (draft: DraftItem): void => {
    form.setValues(draft.values)
    alert(`已恢复草稿：${draft.label}`)
  }

  /** 删除草稿 */
  const deleteDraft = (id: string): void => {
    const newDrafts = drafts.filter(d => d.id !== id)
    setDrafts(newDrafts)
    saveDraftsToStorage(newDrafts)
  }

  return (
    <div>
      <h3>表单快照</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>暂存草稿（localStorage） / 恢复草稿 / 多版本管理</p>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧：表单区域 */}
        <div style={{ flex: 1 }}>
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
                    <FormField name="description" fieldProps={{ label: '描述', component: 'Textarea', componentProps: { rows: 3 } }} />
                    <FormField name="category" fieldProps={{ label: '分类', component: 'Input' }} />
                    <FormField name="priority" fieldProps={{ label: '优先级', component: 'Input' }} />
                    {(
                      <button type="button" onClick={saveDraft} style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>💾 暂存草稿</button>
                    )}
                    {<LayoutFormActions onReset={() => form.reset()} />}
                  </form>
                </FormProvider>
              )
            }}
          </StatusTabs>
        </div>

        {/* 右侧：草稿列表（附加内容） */}
        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, width: 280 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>
            草稿列表
            <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4, marginLeft: 8 }}>{drafts.length}</span>
          </div>
          {drafts.length === 0
            ? <span style={{ color: '#999' }}>暂无草稿</span>
            : (
                <div>
                  {drafts.map(draft => (
                    <div key={draft.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <div style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.label}</div>
                        <span style={{ color: '#999', fontSize: 11 }}>{new Date(draft.timestamp).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => restoreDraft(draft)} style={{ padding: '2px 8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>↩</button>
                        <button type="button" onClick={() => deleteDraft(draft.id)} style={{ padding: '2px 8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#ff4d4f' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>
    </div>
  )
})
