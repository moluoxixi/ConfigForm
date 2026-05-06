import type { CreateRuntimeResolveSnapInput, FormRuntimeResolveSnap } from './types'
import type { FormValues } from '@/types'

/**
 * 创建 runtime 解析快照。
 *
 * 缺省字段仅表示解析上下文为空，不捕获或缓存后续表单状态变化。
 */
export function createResolveSnap<TValues extends FormValues = FormValues>(
  input: CreateRuntimeResolveSnapInput<TValues> = {},
): FormRuntimeResolveSnap<TValues> {
  return {
    errors: input.errors ?? {},
    field: input.field,
    slotName: input.slotName,
    slotScope: input.slotScope,
    values: input.values ?? ({} as TValues),
  }
}
