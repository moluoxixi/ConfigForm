/**
 * Low Code Designer UI 文本与工具配置。
 * React/Vue 共享，保证展示一致性。
 */
export const LOW_CODE_DESIGNER_TEXT = {
  material: {
    title: '物料',
    hint: '拖拽到画布',
    searchPlaceholder: '搜索组件或布局',
    clear: '清空',
    total: '全部',
    filtered: '筛选',
    dragHint: '拖拽后可在画布调整顺序',
  },
  canvas: {
    emptyRoot: '从左侧拖拽一个字段或容器到这里开始设计。',
    emptyContainer: '拖拽字段到该容器',
    emptySection: '拖拽字段到该分组',
    emptyTabs: '请先新增分组',
  },
  toolbar: {
    move: '拖拽节点移动',
    addSection: '新增分组',
    duplicate: '复制',
    remove: '删除',
    removeSection: '删除分组',
  },
} as const

export const LOW_CODE_NODE_TOOLBAR_ICONS = {
  move: '⠿',
  addSection: '＋',
  duplicate: '⎘',
  remove: '✕',
  removeSection: '✕',
} as const
