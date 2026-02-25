import type { FieldTreeNode, ValueDiffEntry } from './types'

/** DevTools 主题色彩定义 */
export interface DevToolsTheme {
  bg: string
  bgPanel: string
  bgHover: string
  bgActive: string
  border: string
  text: string
  textSecondary: string
  textDim: string
  accent: string
  green: string
  red: string
  yellow: string
  purple: string
  shadow: string
  badgeBg: string
  inputBg: string
}

export const DEVTOOLS_LIGHT_THEME: DevToolsTheme = {
  bg: '#ffffff',
  bgPanel: '#f7f8fa',
  bgHover: '#f0f2f5',
  bgActive: '#e8f4ff',
  border: '#e5e7eb',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textDim: '#9ca3af',
  accent: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  shadow: '0 8px 30px rgba(0,0,0,0.12)',
  badgeBg: '#f3f4f6',
  inputBg: '#f9fafb',
}

export const DEVTOOLS_DARK_THEME: DevToolsTheme = {
  bg: '#1a1b2e',
  bgPanel: '#222338',
  bgHover: '#2a2b45',
  bgActive: '#1e3a5f',
  border: '#333456',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textDim: '#64748b',
  accent: '#60a5fa',
  green: '#34d399',
  red: '#f87171',
  yellow: '#fbbf24',
  purple: '#a78bfa',
  shadow: '0 8px 30px rgba(0,0,0,0.4)',
  badgeBg: '#2a2b45',
  inputBg: '#1e1f35',
}

export const DEVTOOLS_PANEL_WIDTH = 720
export const DEVTOOLS_PANEL_HEIGHT = 520
export const DEVTOOLS_TREE_WIDTH = 230

export const DEVTOOLS_TYPE_CONFIG: Record<string, { ch: string, c: string, bg: string }> = {
  field: { ch: 'F', c: '#3b82f6', bg: '#3b82f620' },
  arrayField: { ch: 'A', c: '#10b981', bg: '#10b98120' },
  objectField: { ch: 'O', c: '#8b5cf6', bg: '#8b5cf620' },
  voidField: { ch: 'V', c: '#f59e0b', bg: '#f59e0b20' },
}

export type DevToolsTab = 'tree' | 'events' | 'diff' | 'values'
export type DevToolsFilter = 'all' | 'error' | 'required' | 'modified'

export const DEVTOOLS_TAB_LABELS: Record<DevToolsTab, string> = {
  tree: '字段',
  events: '事件',
  diff: 'Diff',
  values: '数据',
}

export const DEVTOOLS_FILTER_LABELS: Record<DevToolsFilter, string> = {
  all: '全部',
  error: '错误',
  required: '必填',
  modified: '已修改',
}

export function getDevToolsTheme(isDark: boolean): DevToolsTheme {
  return isDark ? DEVTOOLS_DARK_THEME : DEVTOOLS_LIGHT_THEME
}

export function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined')
    return false
  return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
}

export function subscribeSystemDarkMode(listener: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia)
    return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (event: MediaQueryListEvent): void => listener(event.matches)
  if (mq.addEventListener) {
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }
  mq.addListener(handler)
  return () => mq.removeListener(handler)
}

export function resolveEventColor(type: string, theme: DevToolsTheme): string {
  const normalizedType = type.toLowerCase()
  if (normalizedType.includes('failed')) {
    return theme.red
  }
  if (normalizedType.includes('success')) {
    return theme.green
  }
  if (normalizedType.includes('devtools:')) {
    return theme.purple
  }
  return theme.text
}

export function filterTree(
  nodes: FieldTreeNode[],
  search: string,
  filter: DevToolsFilter,
  diff: ValueDiffEntry[],
): FieldTreeNode[] {
  const modifiedPaths = new Set(diff.filter(d => d.changed).map(d => d.path))

  function match(node: FieldTreeNode): boolean {
    if (search
      && !(node.label || node.name).toLowerCase().includes(search.toLowerCase())
      && !node.path.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (filter === 'error' && node.errorCount === 0)
      return false
    if (filter === 'required' && !node.required)
      return false
    if (filter === 'modified' && !modifiedPaths.has(node.path))
      return false
    return true
  }

  function filterNode(node: FieldTreeNode): FieldTreeNode | null {
    const filteredChildren = node.children.map(filterNode).filter(Boolean) as FieldTreeNode[]
    if (match(node) || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren }
    }
    return null
  }

  return nodes.map(filterNode).filter(Boolean) as FieldTreeNode[]
}
