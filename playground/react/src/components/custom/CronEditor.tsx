/**
 * CronEditor：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */
export function CronEditor({ value = '', onChange, presets = [], disabled, preview }: CronEditorProps): React.ReactElement {
  const parts = normalizeParts(value || '')

  /**
   * update Part：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`playground/react/src/components/custom/CronEditor.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param index 参数 `index`用于提供位置序号，支撑排序或插入等序列操作。
   * @param nextValue 参数 `nextValue`用于提供待处理的值并参与结果计算。
   */
  const /**
         * updatePart：执行当前功能逻辑。
         *
         * @param index 参数 index 的输入说明。
         * @param nextValue 参数 nextValue 的输入说明。
         */
    updatePart = (index: number, nextValue: string): void => {
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
