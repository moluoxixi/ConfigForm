import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { observer, RecursionField, useField } from '@moluoxixi/react'
import { Card } from 'antd'
import { ArrayBase } from './ArrayBase'

export interface ArrayCardsProps {
  itemsSchema?: ISchema
}

export const ArrayCards = observer<ArrayCardsProps>(({ itemsSchema }): ReactElement | null => {
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

        {arrayValue.map((_, index) => (
          <ArrayBase.Item key={index} index={index}>
            <Card
              size="small"
              style={{ marginBottom: 12 }}
              title={`#${index + 1}`}
              extra={isEditable
                ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <ArrayBase.MoveUp />
                      <ArrayBase.MoveDown />
                      <ArrayBase.Remove />
                    </div>
                  )
                : null}
            >
              {itemsSchema
                ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                : (
                    <span style={{ color: '#999' }}>
                      Item
                      {index}
                    </span>
                  )}
            </Card>
          </ArrayBase.Item>
        ))}

        {isEditable && <ArrayBase.Addition />}
      </div>
    </ArrayBase>
  )
})
