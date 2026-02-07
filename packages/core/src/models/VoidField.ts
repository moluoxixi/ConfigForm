import type { ComponentType, Disposer, FieldPattern } from '@moluoxixi/shared'
import type { FormInstance, ReactionRule, VoidFieldInstance, VoidFieldProps } from '../types'
import { FormPath, uid } from '@moluoxixi/shared'

/**
 * 虚拟字段模型
 *
 * 不参与数据收集的纯布局/容器节点。
 * 用于 Card / Collapse / Tabs / Grid 等布局组件。
 *
 * 注意：不要直接 new VoidField()，应通过 form.createVoidField() 创建。
 */
export class VoidField implements VoidFieldInstance {
  readonly id: string
  readonly form: FormInstance
  readonly path: string
  readonly name: string

  label: string
  visible: boolean
  disabled: boolean
  readOnly: boolean
  pattern: FieldPattern
  component: string | ComponentType
  componentProps: Record<string, unknown>
  readonly reactions: ReactionRule[]

  private disposers: Disposer[] = []

  constructor(form: FormInstance, props: VoidFieldProps, parentPath = '') {
    this.id = uid('void')
    this.form = form
    this.name = props.name
    this.path = parentPath ? FormPath.join(parentPath, props.name) : props.name

    this.label = props.label ?? ''
    this.visible = props.visible ?? true
    this.disabled = props.disabled ?? false
    this.readOnly = props.readOnly ?? false
    this.pattern = props.pattern ?? 'editable'
    this.component = props.component ?? ''
    this.componentProps = props.componentProps ?? {}
    this.reactions = props.reactions ?? []
  }

  /** 销毁 */
  dispose(): void {
    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []
  }
}
