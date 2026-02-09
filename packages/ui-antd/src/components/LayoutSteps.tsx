import { Button, Steps as ASteps } from 'antd'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/react'
import { observer } from '@moluoxixi/reactive-mobx'
import { useState } from 'react'
import type { ReactElement } from 'react'

export interface LayoutStepsProps {}

/**
 * 分步布局容器
 *
 * 使用框架层 useSchemaItems() 发现步骤面板，
 * 一次只显示当前步骤，自动渲染上一步/下一步按钮。
 */
export const LayoutSteps = observer((_props: LayoutStepsProps): ReactElement => {
  const field = useField()
  const items = useSchemaItems()
  const [current, setCurrent] = useState(0)

  return (
    <div>
      <ASteps
        current={current}
        items={items.map(item => ({ title: item.title }))}
        style={{ marginBottom: 24 }}
      />
      <div>
        {items.map((item, index) => (
          <div key={item.name} style={{ display: index === current ? 'block' : 'none' }}>
            <RecursionField
              schema={item.schema}
              name={item.name}
              basePath={field.path}
              onlyRenderProperties
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>上一步</Button>
        )}
        {current < items.length - 1 && (
          <Button type="primary" onClick={() => setCurrent(current + 1)}>下一步</Button>
        )}
      </div>
    </div>
  )
})
