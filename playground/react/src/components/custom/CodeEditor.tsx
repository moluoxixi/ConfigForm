/**
 * 自定义组件：代码编辑器
 *
 * 基于 <textarea> 实现的简易代码编辑器，等宽字体 + 行号提示。
 * 实际项目可替换为 Monaco Editor / CodeMirror。
 */
import React from 'react'

/**
 * Code Editor Props：类型接口定义。
 * 所属模块：`playground/react/src/components/custom/CodeEditor.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  preview?: boolean
  language?: string
}

/**
 * Code Editor：当前功能模块的核心执行单元。
 * 所属模块：`playground/react/src/components/custom/CodeEditor.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value = '', onChange, disabled, preview, language }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function CodeEditor({ value = '', onChange, disabled, preview, language }: CodeEditorProps): React.ReactElement {
  const lines = (value || '').split('\n').length

  return (
    <div style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {language && (
        <div style={{ padding: '4px 12px', background: '#f5f5f5', borderBottom: '1px solid #d9d9d9', fontSize: 11, color: '#999', fontFamily: 'monospace' }}>
          {language}
          {' '}
          ·
          {lines}
          {' '}
          行
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={preview}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: 200,
          padding: '12px 16px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.6,
          background: '#fafafa',
          color: '#333',
          tabSize: 2,
        }}
      />
    </div>
  )
}
