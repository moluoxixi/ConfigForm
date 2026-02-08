import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 28：富文本编辑器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 RichTextEditor 组件注册
 * - react-quill 富文本编辑器集成（未安装时 Textarea 降级）
 * - 三种模式切换
 */
import React, { lazy, Suspense } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

// ========== 自定义组件：富文本编辑器 ==========

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
  /** HTML 内容 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
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
      <Suspense fallback={<span style={{ color: '#999', fontSize: 13 }}>加载中...</span>}>
        <ReactQuill
          value={html}
          onChange={(v: string) => onChange?.(v)}
          theme="snow"
          style={{ minHeight: 200 }}
        />
      </Suspense>
    )
  }

  /* 未安装 react-quill，降级为 Textarea */
  return (
    <div>
      <div style={{ padding: '8px 16px', marginBottom: 8, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, fontSize: 13 }}>
        react-quill 未安装，使用 Textarea 替代
      </div>
      <textarea
        value={html}
        onChange={e => onChange?.(e.target.value)}
        rows={8}
        placeholder="在此输入 HTML 内容"
        style={{ width: '100%', padding: 8, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
      />
    </div>
  )
})

registerComponent('RichTextEditor', RichTextEditor, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  title: '示例文章',
  content: '<h2>标题</h2><p>这是一段<strong>富文本</strong>内容，支持 <em>格式化</em> 操作。</p>',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    title: {
      type: 'string',
      title: '标题',
      required: true,
      component: 'Input',
      placeholder: '文章标题',
    },
    content: {
      type: 'string',
      title: '正文内容',
      required: true,
      component: 'RichTextEditor',
    },
  },
}

/**
 * 富文本编辑器表单 — ConfigForm + Schema
 *
 * 展示 react-quill 集成、三种模式切换、Textarea 降级方案
 */
export const RichTextForm = observer((): React.ReactElement => (
  <div>
    <h2>富文本编辑器</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>react-quill 集成 / 三种模式 / 未安装时 Textarea 降级 — ConfigForm + Schema</p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
