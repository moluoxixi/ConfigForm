import type { FieldConfig } from '@/types'
import type { ExtractComponentProps } from '@/models/FieldDef'
import { _registerField } from './registry'

/**
 * `@Field` 属性装饰器。
 *
 * 将类属性标注为表单字段，属性名自动作为 `field` key。
 *
 * @example
 * ```typescript
 * class UserForm {
 *   \@Field({
 *     label: '用户名',
 *     component: ElInput,
 *     type: z.string().min(2, '至少2个字符'),
 *     validateOn: 'blur',
 *     transform: (val) => val.trim(),
 *   })
 *   username = ''
 *
 *   \@Field({
 *     label: '年龄',
 *     component: ElInputNumber,
 *     type: z.number().min(0).max(150),
 *     defaultValue: 18,
 *   })
 *   age = 18
 * }
 * ```
 *
 * @param config  除 `field` 外的所有 FieldConfig 字段（field 由属性名自动注入）
 */
export function Field<C>(
  config: Omit<FieldConfig, 'field' | 'component' | 'props'> & {
    component: C
    props?: ExtractComponentProps<C> & {}
  }
): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    // target 是类的原型（prototype），不是实例
    const ctor = (target as any).constructor as Function
    const fieldName = String(propertyKey)

    _registerField(ctor, {
      ...config,
      field: fieldName,
    } as FieldConfig)
  }
}
