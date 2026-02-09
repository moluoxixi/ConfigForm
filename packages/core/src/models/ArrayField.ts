import type { ArrayFieldInstance, ArrayFieldProps, Disposer, FormInstance } from '../types'
import { deepClone, isArray, isFunction } from '@moluoxixi/shared'
import { getReactiveAdapter } from '@moluoxixi/reactive'
import { Field } from './Field'

/**
 * 数组字段模型
 *
 * 继承 Field，额外提供数组操作方法：
 * push / pop / insert / remove / move / duplicate 等
 *
 * 参考 Formily ArrayField 设计：
 * - 数组操作直接修改 value，不做操作前的全量子字段清理
 * - 通过 reaction 监听 value.length 变化，自动清理多余索引的子字段
 * - React/Vue 组件的 unmount 生命周期负责精确移除对应的子字段注册
 */
export class ArrayField<Value extends unknown[] = unknown[]>
  extends Field<Value>
  implements ArrayFieldInstance<Value> {
  minItems: number
  maxItems: number
  itemTemplate?: Value[number] | (() => Value[number])

  /** 自动清理的 reaction disposer（_ 前缀跳过 MobX observable 标注） */
  private _autoCleanDisposer: Disposer | null = null

  constructor(form: FormInstance, props: ArrayFieldProps<Value>, parentPath = '') {
    super(form, props, parentPath)
    this.minItems = props.minItems ?? 0
    this.maxItems = props.maxItems ?? Infinity
    this.itemTemplate = props.itemTemplate

    /* 确保初始值是数组 */
    const current = this.value
    if (!isArray(current)) {
      this.setValue([] as unknown as Value)
    }

    this.setupAutoCleanup()
  }

  /**
   * 参考 Formily ArrayField.makeAutoCleanable：
   * 通过 reaction 监听数组长度变化，自动清理多余索引的子字段。
   * 当数组缩短时（如 remove/pop/reset），索引 >= newLength 的子字段自动销毁。
   */
  private setupAutoCleanup(): void {
    const adapter = getReactiveAdapter()
    let prevLength = this.arrayValue.length

    this._autoCleanDisposer = adapter.reaction(
      () => {
        const val = this.value
        return isArray(val) ? val.length : 0
      },
      (newLength: number) => {
        if (newLength < prevLength) {
          this.cleanupChildrenFrom(newLength)
        }
        prevLength = newLength
      },
    )
  }

  /**
   * 清理索引 >= start 的子字段注册。
   * 参考 Formily cleanupArrayChildren：只清理多余部分，不影响保留的字段。
   */
  private cleanupChildrenFrom(start: number): void {
    this.form.cleanupArrayChildren(this.path, start)
  }

  /** 获取当前数组值 */
  private get arrayValue(): unknown[] {
    const val = this.value
    return isArray(val) ? val : []
  }

  /** 是否可以添加 */
  get canAdd(): boolean {
    return this.arrayValue.length < this.maxItems
  }

  /** 是否可以删除 */
  get canRemove(): boolean {
    return this.arrayValue.length > this.minItems
  }

  /** 创建新项的默认值 */
  private createItem(): Value[number] {
    if (this.itemTemplate) {
      const template = isFunction(this.itemTemplate) ? this.itemTemplate() : this.itemTemplate
      return deepClone(template)
    }
    return undefined as Value[number]
  }

  /** 尾部添加 */
  push(...items: Value[number][]): void {
    if (!this.canAdd)
      return
    const newItems = items.length > 0 ? items : [this.createItem()]
    const arr = [...this.arrayValue, ...newItems]
    this.setValue(arr as unknown as Value)
  }

  /** 尾部移除 */
  pop(): void {
    if (!this.canRemove)
      return
    const arr = [...this.arrayValue]
    arr.pop()
    this.setValue(arr as unknown as Value)
  }

  /** 指定位置插入 */
  insert(index: number, ...items: Value[number][]): void {
    if (!this.canAdd)
      return
    const newItems = items.length > 0 ? items : [this.createItem()]
    const arr = [...this.arrayValue]
    arr.splice(index, 0, ...newItems)
    this.setValue(arr as unknown as Value)
  }

  /** 移除指定项 */
  remove(index: number): void {
    if (!this.canRemove)
      return
    const arr = [...this.arrayValue]
    arr.splice(index, 1)
    this.setValue(arr as unknown as Value)
  }

  /** 移动项 */
  move(from: number, to: number): void {
    const arr = [...this.arrayValue]
    if (from < 0 || from >= arr.length || to < 0 || to >= arr.length)
      return
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    this.setValue(arr as unknown as Value)
  }

  /** 上移 */
  moveUp(index: number): void {
    if (index <= 0)
      return
    this.move(index, index - 1)
  }

  /** 下移 */
  moveDown(index: number): void {
    if (index >= this.arrayValue.length - 1)
      return
    this.move(index, index + 1)
  }

  /** 复制项 */
  duplicate(index: number): void {
    if (!this.canAdd)
      return
    const arr = this.arrayValue
    if (index < 0 || index >= arr.length)
      return
    const cloned = deepClone(arr[index])
    const newArr = [...arr]
    newArr.splice(index + 1, 0, cloned)
    this.setValue(newArr as unknown as Value)
  }

  /** 替换项 */
  replace(index: number, item: Value[number]): void {
    const arr = [...this.arrayValue]
    if (index < 0 || index >= arr.length)
      return
    arr[index] = item
    this.setValue(arr as unknown as Value)
  }

  /** 销毁时清理 auto-cleanup reaction */
  override dispose(): void {
    this._autoCleanDisposer?.()
    this._autoCleanDisposer = null
    super.dispose()
  }
}
