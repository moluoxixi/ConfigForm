import type { SceneConfig } from '../types'

/**
 * 场景：虚拟滚动
 *
 * 演示虚拟滚动大列表表单能力。
 * 使用 CSS 虚拟滚动技术，仅渲染可视区域内的行。
 * 容器高 400px，行高 48px，支持批量添加/删除数据。
 * 由于字段为动态列表（items 数组），fields 仅包含每行的基础字段定义。
 */

/** 虚拟滚动常量 */
const ROW_HEIGHT = 48
const BUFFER = 5
const CONTAINER_HEIGHT = 400
const DEFAULT_ITEM_COUNT = 100

/**
 * 生成初始列表数据
 *
 * @param count - 数据条数
 * @returns items 数组
 */
function generateItems(count: number): Array<{ name: string, email: string }> {
  return Array.from({ length: count }, (_, i) => ({
    name: `用户 ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }))
}

const config: SceneConfig & {
  rowHeight: number
  buffer: number
  containerHeight: number
  defaultItemCount: number
  generateItems: typeof generateItems
} = {
  title: '虚拟滚动',
  description: '虚拟滚动大列表 — 仅渲染可视区域内的行，支持批量添加/删除',

  initialValues: {
    items: generateItems(DEFAULT_ITEM_COUNT),
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      items: {
        type: 'array',
        title: '数据列表',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '姓名' },
            email: { type: 'string', title: '邮箱' },
          },
        },
      },
    },
  },

  /* 每行的基础字段定义（动态列表中每一项的字段） */
  fields: [
    { name: 'name', label: '姓名', component: 'Input', componentProps: { placeholder: '姓名', size: 'small' } },
    { name: 'email', label: '邮箱', component: 'Input', componentProps: { placeholder: '邮箱', size: 'small' } },
  ],

  /** 行高（像素） */
  rowHeight: ROW_HEIGHT,
  /** 缓冲行数 */
  buffer: BUFFER,
  /** 容器高度（像素） */
  containerHeight: CONTAINER_HEIGHT,
  /** 默认数据条数 */
  defaultItemCount: DEFAULT_ITEM_COUNT,
  /** 生成初始列表数据（供实现侧使用） */
  generateItems,
}

export default config
