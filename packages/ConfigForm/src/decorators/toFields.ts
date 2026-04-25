import { FieldDef } from '@/types'
import type { FieldConfig } from '@/types'
import { _getFields } from './registry'

/**
 * 将经 `@Field` 装饰的类（或实例）转换为 `FieldDef[]`。
 *
 * 继承场景：父类字段在前，子类字段在后，同名字段子类覆盖父类。
 *
 * @example
 * ```typescript
 * const fields = toFields(UserForm)        // 传构造函数（推荐）
 * const fields = toFields(new UserForm())  // 传实例
 * ```
 */
export function toFields(formClassOrInstance: (new (...args: any[]) => any) | object): FieldDef[] {
  const ctor = typeof formClassOrInstance === 'function'
    ? formClassOrInstance
    : (formClassOrInstance as any).constructor as Function

  const rawFields = _getFields(ctor)

  if (rawFields.length === 0) {
    console.warn(
      `[ConfigForm] toFields: "${ctor.name}" 上未找到 @Field 装饰的属性。`
      + ' 请确认已使用 @Field 装饰器且 tsconfig 已开启 experimentalDecorators。',
    )
  }

  // 转为 FieldDef 实例（触发构造时规范化）
  return rawFields.map(config => new FieldDef(config as FieldConfig))
}
