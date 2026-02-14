import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { observer, RecursionField, useField } from '@moluoxixi/react'
import { Collapse } from 'antd'
import { ArrayBase } from './ArrayBase'

export interface ArrayCollapseProps {
  itemsSchema?: ISchema
  defaultExpandAll?: boolean
}

export const ArrayCollapse = observer<ArrayCollapseProps>(({ itemsSchema, defaultExpandAll = true }): ReactElement | null => {
  let field: ArrayFieldInstance | null = null
  try {
    field = useField() as unknown as ArrayFieldInstance
  }
  catch {
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []
  const isEditable = field.editable
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems
  const activeKey = defaultExpandAll ? arrayValue.map((_, index) => String(index)) : []

  return (
    <ArrayBase>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#303133' }}>
            {field.label || field.path}
          </span>
          <span style={{ color: '#909399', fontSize: 13 }}>
            {arrayValue.length}
            {' '}
            /
            {maxItems}
          </span>
        </div>

        <Collapse
          defaultActiveKey={activeKey}
          items={arrayValue.map((_, index) => ({
            key: String(index),
            label: `#${index + 1}`,
            extra: isEditable
              ? (
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <ArrayBase.Item index={index}>
                      <ArrayBase.MoveUp />
                      <ArrayBase.MoveDown />
                      <ArrayBase.Remove />
                    </ArrayBase.Item>
                  </div>
                )
              : null,
            children: (
              <ArrayBase.Item index={index}>
                {itemsSchema
                  ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                  : (
                      <span style={{ color: '#999' }}>
                        Item
                        {index}
                      </span>
                    )}
              </ArrayBase.Item>
            ),
          }))}
        />

        {isEditable && <div style={{ marginTop: 8 }}><ArrayBase.Addition /></div>}
      </div>
    </ArrayBase>
  )
})
