import type { Component } from 'vue'

/** UI 库适配器接口 */
export interface UIAdapter {
  setup: () => void
  StatusTabs: Component
}

/** 支持的 UI 库 */
export type UILib = 'antd-vue' | 'element-plus'

/** UI 库适配器映射（懒加载） */
export const adapters: Record<UILib, () => Promise<UIAdapter>> = {
  'antd-vue': () => import('./antd-vue'),
  'element-plus': () => import('./element-plus'),
}
