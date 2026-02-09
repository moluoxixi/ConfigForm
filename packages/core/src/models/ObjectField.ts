import type { FormInstance, ObjectFieldInstance, ObjectFieldProps } from '../types'
import { deepClone, FormPath, isObject } from '@moluoxixi/shared'
import { Field } from './Field'

/**
 * 对象字段模型
 *
 * 继承 Field，额外提供对象属性的动态管理方法：
 * addProperty / removeProperty / existProperty / getPropertyNames
 *
 * 参考 Formily ObjectField 设计：
 * - 对象字段的值是一个 Record<string, unknown>
 * - 支持运行时动态增删属性
 * - 移除属性时自动清理对应的子字段注册
 *
 * 典型场景：
 * - 动态 JSON 配置编辑器
 * - 可扩展的表单分组
 * - 运行时动态增删字段
 *
 * 注意：不要直接 new ObjectField()，应通过 form.createObjectField() 创建。
 */
export class ObjectField<Value extends Record<string, unknown> = Record<string, unknown>>
  extends Field<Value>
  implements ObjectFieldInstance<Value> {
  constructor(form: FormInstance, props: ObjectFieldProps<Value>, parentPath = '') {
    super(form, props, parentPath)

    /* 确保初始值是对象 */
    const current = this.value
    if (!isObject(current)) {
      this.setValue({} as Value)
    }
  }

  /** 获取当前对象值 */
  private get objectValue(): Record<string, unknown> {
    const val = this.value
    return isObject(val) ? val as Record<string, unknown> : {}
  }

  /**
   * 动态添加属性
   *
   * 在对象值中添加一个新属性，并触发值变更通知。
   * 如果属性已存在，则更新其值。
   *
   * @param name - 属性名
   * @param value - 属性值
   */
  addProperty(name: string, value: unknown): void {
    const obj = { ...this.objectValue }
    obj[name] = deepClone(value)
    this.setValue(obj as Value)
  }

  /**
   * 动态移除属性
   *
   * 从对象值中删除指定属性，并清理对应的子字段注册。
   *
   * @param name - 属性名
   */
  removeProperty(name: string): void {
    const obj = { ...this.objectValue }
    if (!(name in obj)) return

    delete obj[name]

    /* 清理该属性对应的子字段注册 */
    const childPath = FormPath.join(this.path, name)
    this.form.removeField(childPath)

    this.setValue(obj as Value)
  }

  /**
   * 检查属性是否存在
   *
   * @param name - 属性名
   * @returns 属性是否存在于当前对象值中
   */
  existProperty(name: string): boolean {
    return name in this.objectValue
  }

  /**
   * 获取所有属性名
   *
   * @returns 当前对象值的所有属性名数组
   */
  getPropertyNames(): string[] {
    return Object.keys(this.objectValue)
  }
}
