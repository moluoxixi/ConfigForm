import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'

/* ======================== 类型定义 ======================== */

/**
 * format Value：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/DiffViewer.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function _formatValue(value: unknown): string {
  if (value === undefined || value === null)
    return '-'
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}
