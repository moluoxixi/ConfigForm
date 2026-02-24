import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { VNodeChild } from 'vue'

/**
 * Render Material Item：类型别名定义。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type RenderMaterialItem = (item: MaterialItem) => VNodeChild
