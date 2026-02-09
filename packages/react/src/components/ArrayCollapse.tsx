import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import { observer } from '@moluoxixi/reactive-react'
import React, { useContext, useState } from 'react'
import { FieldContext, FormContext } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

export interface ArrayCollapseProps {
  /** 数组项的 schema 定义 */
  itemsSchema?: ISchema
  /** 默认是否全部展开 */
  defaultExpandAll?: boolean
}

/**
 * ArrayCollapse — 折叠式数组渲染组件
 *
 * 每个数组项渲染为一个可折叠的面板，面板标题显示序号，
 * 面板头部右侧包含操作按钮。
 *
 * 渲染结构：
 * ```
 * ArrayBase
 *   ├─ CollapsePanel[0]
 *   │    ├─ 标题：#1（可点击折叠/展开）
 *   │    ├─ 操作按钮（MoveUp/MoveDown/Remove）
 *   │    └─ RecursionField(schema=items, name=0)
 *   ├─ CollapsePanel[1]
 *   │    └─ ...
 *   └─ ArrayBase.Addition
 * ```
 */
export const ArrayCollapse = observer<ArrayCollapseProps>(({ itemsSchema, defaultExpandAll = true }) => {
  const field = useContext(FieldContext) as ArrayFieldInstance | null
  const form = useContext(FormContext)

  if (!field) {
    console.warn('[ArrayCollapse] 未找到 ArrayField 上下文')
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []

  const fp = field.pattern || 'editable'
  const formP = form?.pattern ?? 'editable'
  const isEditable = fp === 'editable' && formP === 'editable'
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

  /** 管理每个面板的展开/折叠状态 */
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(() => {
    if (defaultExpandAll) {
      return new Set(arrayValue.map((_, i) => i))
    }
    return new Set<number>()
  })

  const togglePanel = (index: number): void => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      }
      else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <ArrayBase>
      <div style={{ width: '100%' }}>
        {/* 标题 + 数量 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#303133' }}>
            {field.label || field.path}
          </span>
          <span style={{ color: '#909399', fontSize: 13 }}>
            {arrayValue.length} / {maxItems}
          </span>
        </div>

        {/* 折叠面板列表 */}
        {arrayValue.map((_, index) => {
          const isExpanded = expandedKeys.has(index)

          return (
            <ArrayBase.Item key={index} index={index}>
              <div style={{
                marginBottom: 4,
                border: '1px solid #e8e8e8',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                {/* 面板头部（可点击折叠/展开） */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    background: '#fafafa',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => togglePanel(index)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid #999',
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                    }} />
                    <span style={{ fontWeight: 500, color: '#333', fontSize: 14 }}>
                      #{index + 1}
                    </span>
                  </span>
                  {isEditable && (
                    <div
                      style={{ display: 'flex', gap: 4 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrayBase.MoveUp />
                      <ArrayBase.MoveDown />
                      <ArrayBase.Remove />
                    </div>
                  )}
                </div>

                {/* 面板内容（展开时显示） */}
                {isExpanded && (
                  <div style={{ padding: 16, borderTop: '1px solid #e8e8e8' }}>
                    {itemsSchema
                      ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                      : <span style={{ color: '#999' }}>Item {index}</span>}
                  </div>
                )}
              </div>
            </ArrayBase.Item>
          )
        })}

        {isEditable && <ArrayBase.Addition />}
      </div>
    </ArrayBase>
  )
})
