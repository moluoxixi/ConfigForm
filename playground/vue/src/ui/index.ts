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
  /**
   * antd-vue：执行当前功能逻辑。
   *
   * @returns 返回当前功能的处理结果。
   */

  'antd-vue': () => import('./antd-vue'),
  /**
   * element-plus：执行当前功能逻辑。
   *
   * @returns 返回当前功能的处理结果。
   */

  'element-plus': () => import('./element-plus'),
}
