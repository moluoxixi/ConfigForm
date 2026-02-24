import type { DesignerDropTarget } from '../designer'
import { keyToTarget } from '../designer'

/**
 * hasMountedDesignerSortables：执行当前功能逻辑。
 *
 * @param result 参数 result 的输入说明。
 *
 * @returns 返回当前功能的处理结果。
 */
export function hasMountedDesignerSortables(result: DesignerSortableMountResult): boolean {
  return result.materialMounted > 0 && result.canvasMounted > 0
}
