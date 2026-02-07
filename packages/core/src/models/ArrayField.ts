import type { ArrayFieldInstance, ArrayFieldProps, FormInstance } from '../types'
import { deepClone, isArray, isFunction } from '@moluoxixi/shared'
import { Field } from './Field'

/**
 * 数组字段模型
 *
 * 继承 Field，额外提供数组操作方法：
 * push / pop / insert / remove / move / duplicate 等
 *
 * 结构性操作（remove / pop / move / replace）会在修改数组前
 * 先清理所有子字段注册，避免残留的"幽灵字段"影响验证和联动。
 */
export class ArrayField<Value extends unknown[] = unknown[]>
  extends Field<Value>
  implements ArrayFieldInstance<Value> {
  minItems: number
  maxItems: number
  itemTemplate?: Value[number] | (() => Value[number])

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

  /**
   * 清理当前数组路径下的所有子字段注册。
   * 在结构性数组操作前调用，避免子字段索引错位后残留。
   */
  private cleanupChildren(): void {
    this.form.cleanupChildFields(this.path)
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
    this.cleanupChildren()
    const arr = [...this.arrayValue]
    arr.pop()
    this.setValue(arr as unknown as Value)
  }

  /** 指定位置插入 */
  insert(index: number, ...items: Value[number][]): void {
    if (!this.canAdd)
      return
    this.cleanupChildren()
    const newItems = items.length > 0 ? items : [this.createItem()]
    const arr = [...this.arrayValue]
    arr.splice(index, 0, ...newItems)
    this.setValue(arr as unknown as Value)
  }

  /** 移除指定项 */
  remove(index: number): void {
    if (!this.canRemove)
      return
    this.cleanupChildren()
    const arr = [...this.arrayValue]
    arr.splice(index, 1)
    this.setValue(arr as unknown as Value)
  }

  /** 移动项 */
  move(from: number, to: number): void {
    const arr = [...this.arrayValue]
    if (from < 0 || from >= arr.length || to < 0 || to >= arr.length)
      return
    this.cleanupChildren()
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
    this.cleanupChildren()
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
    this.cleanupChildren()
    arr[index] = item
    this.setValue(arr as unknown as Value)
  }
}
