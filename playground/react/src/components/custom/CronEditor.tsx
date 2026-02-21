/**
 * 自定义组件：Cron 表达式编辑器
 *
 * 手动输入 + 快捷预设按钮 + 实时解读。
 */
import React from 'react'

/**
 * Cron 各段含义
 * normalize Parts：负责“规范化normalize Parts”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Parts 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return CRON_LABELS.map((_, index) => pieces[index] ?? '*')
}

/**
 * 简单的 Cron 解读（非完整解析）
 * Cron Editor：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Cron Editor 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function CronEditor({ value = '', onChange, presets = [], disabled, preview }: CronEditorProps): React.ReactElement {
  const parts = normalizeParts(value || '')

  const updatePart = (index: number, nextValue: string): void => {
    const nextParts = normalizeParts(value || '')
    const next = nextValue.trim()
    nextParts[index] = next.length > 0 ? next : '*'
    onChange?.(nextParts.join(' '))
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12 }}>
      {/* 输入框 */}
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={preview}
        placeholder="* * * * *"
        style={{
          width: '100%',
          padding: '6px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 14,
          marginBottom: 8,
          background: disabled || preview ? '#f5f5f5' : '#fff',
        }}
      />

      {/* 分段编辑 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {CRON_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <input
              type="text"
              value={parts[i]}
              onChange={e => updatePart(i, e.target.value)}
              disabled={disabled}
              readOnly={preview}
              placeholder="*"
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 12,
                textAlign: 'center',
                background: disabled || preview ? '#f5f5f5' : '#fff',
              }}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 解读 */}
      <div style={{ fontSize: 12, color: '#1677ff', marginBottom: 8 }}>
        解读：
        {describeCron(value)}
      </div>

      {/* 预设按钮 */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => !disabled && !preview && onChange?.(p.value)}
              disabled={disabled || preview}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                background: value === p.value ? '#e6f4ff' : '#fff',
                color: value === p.value ? '#1677ff' : '#333',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
