import type { ReactElement } from 'react'
import { PropertiesPanel } from '../../../../panels/PropertiesPanel'
import type { DesignerPropertiesPaneProps } from '../../types'

export function DesignerPropertiesRenderer(props: DesignerPropertiesPaneProps): ReactElement {
  return <PropertiesPanel {...props} />
}
