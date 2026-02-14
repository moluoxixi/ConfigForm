import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import { observer, RecursionField, useField } from '@moluoxixi/react'
import { ArrayBase } from './ArrayBase'

export interface ArrayFieldProps {
  itemsSchema?: ISchema
  sortable?: boolean
}

export const ArrayField = observer<ArrayFieldProps>(({ itemsSchema }) => {
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
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 8,
              padding: 12,
              background: index % 2 === 0 ? '#fafafa' : '#fff',
              borderRadius: 4,
              border: '1px solid #ebeef5',
            }}
            >
              <ArrayBase.Index />
              <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {itemsSchema
                  ? <RecursionField schema={itemsSchema} name={index} basePath={field.path} />
                  : (
                      <span style={{ color: '#999' }}>
                        Item
                        {index}
                      </span>
                    )}
              </div>
              <div style={{
                display: 'flex',
                gap: 4,
                flexShrink: 0,
                visibility: isEditable ? 'visible' : 'hidden',
              }}
              >
                <ArrayBase.MoveUp />
                <ArrayBase.MoveDown />
                <ArrayBase.Remove />
              </div>
            </div>
          </ArrayBase.Item>
        ))}

        {isEditable && <ArrayBase.Addition />}
      </div>
    </ArrayBase>
  )
})

/* 兼容历史命名 */
export const ArrayItems = ArrayField
