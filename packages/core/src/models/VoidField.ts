import type { ComponentType, Disposer, FieldPattern } from '@moluoxixi/shared'
import type { FieldInstance, FormInstance, ReactionRule, VoidFieldInstance, VoidFieldProps } from '../types'
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

  /** 是否已挂载到 DOM */
  mounted: boolean

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
    this.mounted = false

    this.label = props.label ?? ''
    this.visible = props.visible ?? true
    this.disabled = props.disabled ?? false
    this.readOnly = props.readOnly ?? false
    this.pattern = props.pattern ?? 'editable'
    this.component = props.component ?? ''
    this.componentProps = props.componentProps ?? {}
    this.reactions = props.reactions ?? []
  }

  /**
   * 字段挂载
   *
   * 由框架桥接层在组件挂载到 DOM 后调用。
   */
  mount(): void {
    if (this.mounted) return
    this.mounted = true
    this.form.notifyFieldMount(this as unknown as FieldInstance)
  }

  /**
   * 字段卸载
   *
   * 由框架桥接层在组件从 DOM 卸载前调用。
   */
  unmount(): void {
    if (!this.mounted) return
    this.mounted = false
    this.form.notifyFieldUnmount(this as unknown as FieldInstance)
  }

  /** 销毁 */
  dispose(): void {
    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []
    this.mounted = false
  }
}
