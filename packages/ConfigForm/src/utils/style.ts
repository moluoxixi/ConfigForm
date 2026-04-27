/** 将 labelWidth 统一为 CSS 值字符串 */
export function resolveLabelWidth(width?: string | number): string | undefined {
  if (!width) return undefined
  return typeof width === 'number' ? `${width}px` : width
}
