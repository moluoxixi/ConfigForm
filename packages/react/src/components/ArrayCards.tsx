import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import { observer } from '@moluoxixi/reactive-react'
import React, { useContext } from 'react'
import { FieldContext } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

export interface ArrayCardsProps {
  /** 数组项的 schema 定义 */
  itemsSchema?: ISchema
}

/**
 * ArrayCards — 卡片式数组渲染组件
 *
 * 每个数组项渲染为一个独立的卡片，卡片标题显示序号，
 * 卡片头部包含操作按钮（上移/下移/删除）。
 *
 * 渲染结构：
 * ```
 * ArrayBase
 *   ├─ Card[0]
 *   │    ├─ 标题：#1
 *   │    ├─ 操作按钮（MoveUp/MoveDown/Remove）
 *   │    └─ RecursionField(schema=items, name=0)
 *   ├─ Card[1]
 *   │    └─ ...
 *   └─ ArrayBase.Addition
 * ```
 */
export const ArrayCards = observer<ArrayCardsProps>(({ itemsSchema }) => {
  const field = useContext(FieldContext) as ArrayFieldInstance | null

  if (!field) {
    console.warn('[ArrayCards] 未找到 ArrayField 上下文')
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []

  const isEditable = field.editable
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

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

        {/* 卡片列表 */}
        {arrayValue.map((_, index) => (
          <ArrayBase.Item key={index} index={index}>
            <div style={{
              marginBottom: 16,
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              {/* 卡片头部 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px',
                background: '#fafafa',
                borderBottom: '1px solid #e8e8e8',
              }}>
                <span style={{ fontWeight: 500, color: '#333', fontSize: 14 }}>
                  #{index + 1}
                </span>
                {isEditable && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <ArrayBase.MoveUp />
                    <ArrayBase.MoveDown />
                    <ArrayBase.Remove />
                  </div>
                )}
              </div>

              {/* 卡片内容 */}
              <div style={{ padding: 16 }}>
                {itemsSchema
                  ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                  : <span style={{ color: '#999' }}>Item {index}</span>}
              </div>
            </div>
          </ArrayBase.Item>
        ))}

        {isEditable && <ArrayBase.Addition />}
      </div>
    </ArrayBase>
  )
})
