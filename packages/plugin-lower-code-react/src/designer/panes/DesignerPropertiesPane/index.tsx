import type { ComponentProps, ReactElement } from 'react'
import { PropertiesPanel } from '../../panels/PropertiesPanel'

export type DesignerPropertiesPaneProps = ComponentProps<typeof PropertiesPanel>

export function DesignerPropertiesPane(props: DesignerPropertiesPaneProps): ReactElement {
  return <PropertiesPanel {...props} />
}
