import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 28：富文本编辑器
 *
 * 覆盖：
 * - react-quill 富文本编辑器集成
 * - 表单值同步
 * - 三种模式切换（编辑 / 只读 / 禁用）
 * - 内容预览
 *
 * 依赖：react-quill（https://www.npmjs.com/package/react-quill）
 */
import React, { lazy, Suspense } from 'react'

setupAntd()

/** 懒加载 ReactQuill（可能未安装） */
let ReactQuill: React.ComponentType<{
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
  theme?: string
  style?: React.CSSProperties
}> | null = null

try {
  ReactQuill = lazy(() => import('react-quill'))
}
catch {
  ReactQuill = null
}

/** 富文本编辑器组件 Props */
interface RichTextEditorProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
  readOnly: boolean
}

/**
 * 富文本编辑器自定义组件
 *
 * - 编辑态：ReactQuill（未安装时降级为 Textarea）
 * - 禁用态：HTML 预览（半透明）
 * - 只读态：HTML 预览
 */
const RichTextEditor = observer(({ value, onChange, disabled, readOnly }: RichTextEditorProps): React.ReactElement => {
  const html = value ?? ''

  /* 只读态 / 禁用态：HTML 预览 */
  if (readOnly || disabled) {
    return (
      <div
        style={{
          padding: 12,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          minHeight: 100,
          background: '#fafafa',
          opacity: disabled ? 0.7 : 1,
        }}
        dangerouslySetInnerHTML={{ __html: html || '<span style="color:#999">暂无内容</span>' }}
      />
    )
  }

  /* 编辑态：ReactQuill（可用时） */
  if (ReactQuill) {
    return (
      <Suspense fallback={<span>加载中...</span>}>
        <ReactQuill
          value={html}
          onChange={(v: string) => onChange(v)}
          theme="snow"
          style={{ minHeight: 200 }}
        />
      </Suspense>
    )
  }

  /* 未安装 react-quill，降级为 Textarea */
  return (
    <div>
      <div style={{ padding: '8px 16px', marginBottom: 8, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, fontSize: 13 }}>react-quill 未安装，使用 Textarea 替代</div>
      <textarea
        value={html}
        onChange={e => onChange(e.target.value)}
        rows={8}
        placeholder="在此输入 HTML 内容"
        style={{ width: '100%', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
      />
    </div>
  )
})

registerComponent('RichTextEditor', RichTextEditor, { defaultWrapper: 'FormItem' })

export const RichTextForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      title: '示例文章',
      content: '<h2>标题</h2><p>这是一段<strong>富文本</strong>内容，支持 <em>格式化</em> 操作。</p>',
    },
  })

  return (
    <div>
      <h3>富文本编辑器</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>react-quill 集成 / 三种模式 / 未安装时 Textarea 降级</p>
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
                <FormField name="title" fieldProps={{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '文章标题' } }} />
                <FormField name="content" fieldProps={{ label: '正文内容', required: true, component: 'RichTextEditor' }} />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
