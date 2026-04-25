import type { FieldDef } from '../types'

/**
 * 装饰器元数据注册表。
 *
 * key   = 被装饰的类的构造函数（prototype.constructor）
 * value = 按声明顺序排列的 FieldDef 数组
 *
 * 使用 WeakMap，不持有类引用，GC 友好，无需 reflect-metadata。
 */
const _registry = new WeakMap<Function, FieldDef[]>()

/**
 * 向指定构造函数注册一个字段元数据。
 * 内部使用，由 @Field 装饰器调用。
 *
 * @param ctor   类的构造函数（`target.constructor`）
 * @param meta   完整的 FieldDef（field 已被注入为属性名）
 */
export function _registerField(ctor: Function, meta: FieldDef): void {
  if (!_registry.has(ctor)) {
    _registry.set(ctor, [])
  }
  // legacy decorators 对不同属性的执行顺序与声明顺序一致（top-down），直接 push
  _registry.get(ctor)!.push(meta)
}

/**
 * 读取指定构造函数（及其继承链）上注册的所有 FieldDef。
 *
 * 继承规则：父类字段在前，子类字段在后，子类同名字段覆盖父类。
 *
 * @param ctor 目标构造函数
 */
export function _getFields(ctor: Function): FieldDef[] {
  const chain: FieldDef[][] = []

  let current: Function | null = ctor
  while (current && current !== Function.prototype && current !== Object.prototype) {
    const own = _registry.get(current)
    if (own && own.length > 0) {
      chain.unshift(own) // 父类在前
    }
    current = Object.getPrototypeOf(current) as Function | null
  }

  // 展平并按 field 去重（子类靠后，覆盖父类同名字段）
  const merged = new Map<string, FieldDef>()
  for (const layer of chain) {
    for (const def of layer) {
      merged.set(def.field, def)
    }
  }

  return Array.from(merged.values())
}
