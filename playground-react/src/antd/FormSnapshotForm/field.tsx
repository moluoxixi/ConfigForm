import { DeleteOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import {
  Button,
  Card,
  List,
  message,
  Tag,
  Typography,
} from 'antd'
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

const { Title, Paragraph, Text } = Typography

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
    message.success('草稿已暂存')
  }

  /** 恢复草稿 */
  const restoreDraft = (draft: DraftItem): void => {
    form.setValues(draft.values)
    message.success(`已恢复草稿：${draft.label}`)
  }

  /** 删除草稿 */
  const deleteDraft = (id: string): void => {
    const newDrafts = drafts.filter(d => d.id !== id)
    setDrafts(newDrafts)
    saveDraftsToStorage(newDrafts)
  }

  return (
    <div>
      <Title level={3}>表单快照</Title>
      <Paragraph type="secondary">暂存草稿（localStorage） / 恢复草稿 / 多版本管理</Paragraph>

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
                    {mode === 'editable' && (
                      <Button icon={<SaveOutlined />} onClick={saveDraft}>暂存草稿</Button>
                    )}
                    {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
                  </form>
                </FormProvider>
              )
            }}
          </StatusTabs>
        </div>

        {/* 右侧：草稿列表（附加内容） */}
        <Card
          title={(
            <span>
              草稿列表
              <Tag>{drafts.length}</Tag>
            </span>
          )}
          size="small"
          style={{ width: 280 }}
        >
          {drafts.length === 0
            ? <Text type="secondary">暂无草稿</Text>
            : (
                <List
                  size="small"
                  dataSource={drafts}
                  renderItem={draft => (
                    <List.Item
                      actions={[
                        <Button key="restore" size="small" icon={<UndoOutlined />} onClick={() => restoreDraft(draft)} />,
                        <Button key="delete" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteDraft(draft.id)} />,
                      ]}
                    >
                      <div>
                        <Text ellipsis style={{ maxWidth: 120 }}>{draft.label}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{new Date(draft.timestamp).toLocaleString()}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              )}
        </Card>
      </div>
    </div>
  )
})
