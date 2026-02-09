import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { FieldContext, FormContext } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

export interface ArrayItemsProps {
  /** 数组项的 schema 定义（由 SchemaField 通过 componentProps.itemsSchema 传入） */
  itemsSchema?: ISchema
}

/**
 * ArrayItems — 数组项渲染组件（React 版，参考 Vue 端 ArrayItems）
 *
 * 作为 array 字段的默认 component，注册到组件注册表中。
 * 当 schema 定义 `type: 'array'` 时，由 ReactiveField 解析并渲染此组件。
 *
 * 内部使用 ArrayBase 提供操作上下文，使用 RecursionField 递归渲染每个数组项。
 *
 * 渲染结构：
 * ```
 * ArrayBase
 *   ├─ 标题行（字段名 + 数量统计）
 *   ├─ ArrayBase.Item[0]
 *   │    ├─ ArrayBase.Index
 *   │    ├─ RecursionField(schema=items, name=0, basePath=fieldPath)
 *   │    ├─ ArrayBase.MoveUp
 *   │    ├─ ArrayBase.MoveDown
 *   │    └─ ArrayBase.Remove
 *   ├─ ArrayBase.Item[1]
 *   │    └─ ...
 *   └─ ArrayBase.Addition
 * ```
 */
export const ArrayItems = observer<ArrayItemsProps>(({ itemsSchema }) => {
  const field = useContext(FieldContext) as ArrayFieldInstance | null
  const form = useContext(FormContext)

  if (!field) {
    console.warn('[ArrayItems] 未找到 ArrayField 上下文')
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []

  /**
   * pattern 判断逻辑与 ReactiveField 对齐：
   * form.pattern 作为全局覆盖，只要 form 或 field 任一为 readOnly/disabled 就非编辑态
   */
  const fp = field.pattern || 'editable'
  const formP = form?.pattern ?? 'editable'
  const isEditable = fp === 'editable' && formP === 'editable'
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

        {/* 数组项列表 */}
        {arrayValue.map((_, index) => (
          <ArrayBase.Item key={index} index={index}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 8,
              padding: 12,
              background: index % 2 === 0 ? '#fafafa' : '#fff',
              borderRadius: 4,
              border: '1px solid #ebeef5',
            }}>
              {/* 序号 */}
              <ArrayBase.Index />

              {/* 内容区域：使用 RecursionField 递归渲染 */}
              <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {itemsSchema
                  ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                  : <span style={{ color: '#999' }}>Item {index}</span>}
              </div>

              {/* 操作按钮区域 */}
              {isEditable && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <ArrayBase.MoveUp />
                  <ArrayBase.MoveDown />
                  <ArrayBase.Remove />
                </div>
              )}
            </div>
          </ArrayBase.Item>
        ))}

        {/* 添加按钮（虚线全宽，视觉上与上方项目卡片同组） */}
        {isEditable && <ArrayBase.Addition />}
      </div>
    </ArrayBase>
  )
})
