import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'

/**
 * DiffViewer 组件属性。
 */
export interface DiffViewerProps {
  diffs: DiffFieldView[]
  labelMap?: Record<string, string>
  onlyDirty?: boolean
}

/**
 * 差异类型对应颜色配置。
 */
const COLORS: Record<DiffType, { bg: string, text: string, border: string }> = {
  added: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  removed: { bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  changed: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  unchanged: { bg: '#fff', text: '#999', border: '#f0f0f0' },
}

/**
 * 差异类型标签映射。
 */
const TYPE_LABELS: Record<DiffType, string> = {
  added: '新增',
  removed: '删除',
  changed: '变更',
  unchanged: '未变',
}

/** 外层容器样式。 */
const containerStyle: Record<string, string> = {
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  overflow: 'hidden',
  fontSize: '14px',
}

/** 表头行样式。 */
const headerStyle: Record<string, string> = {
  display: 'flex',
  background: '#fafafa',
  borderBottom: '1px solid #e8e8e8',
  fontWeight: '600',
  color: '#333',
}

/** 表头单元格样式。 */
const headerCellStyle: Record<string, string> = {
  flex: '1',
  padding: '10px 12px',
}

/** 数据行样式。 */
const rowStyle: Record<string, string> = {
  display: 'flex',
  borderBottom: '1px solid #f0f0f0',
}

/** 普通单元格样式。 */
const cellStyle: Record<string, string> = {
  flex: '1',
  padding: '8px 12px',
  wordBreak: 'break-all',
}

/** 空状态样式。 */
const emptyStyle: Record<string, string> = {
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  background: '#fafafa',
  borderRadius: '8px',
  border: '1px dashed #d9d9d9',
}

/**
 * 把任意值格式化为可展示文本。
 * @param value 待格式化值。
 * @returns 返回展示文本。
 */
function formatValue(value: unknown): string {
  if (value === undefined || value === null)
    return '-'
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}

/**
 * 差异可视化组件。
 * 以“字段 / 旧值 / 新值 / 状态”四列展示变化内容。
 */
export const DiffViewer = defineComponent({
  name: 'DiffViewer',
  props: {
    diffs: {
      type: Array as PropType<DiffFieldView[]>,
      required: true,
    },
    labelMap: {
      type: Object as PropType<Record<string, string>>,
      /** 默认空映射。 */
      default: () => ({}),
    },
    onlyDirty: {
      type: Boolean,
      default: true,
    },
  },
  /**
   * 根据筛选条件构造差异列表渲染函数。
   *
   * @param props 组件属性。
   * @returns 返回渲染函数。
   */
  setup(props) {
    const filteredDiffs = computed(() =>
      props.onlyDirty
        ? props.diffs.filter(d => d.dirty)
        : props.diffs,
    )

    return () => {
      if (filteredDiffs.value.length === 0) {
        return h('div', { style: emptyStyle }, '无差异')
      }

      return h('div', { style: containerStyle }, [
        h('div', { style: headerStyle }, [
          h('div', { style: headerCellStyle }, '字段'),
          h('div', { style: headerCellStyle }, '旧值'),
          h('div', { style: headerCellStyle }, '新值'),
          h('div', { style: { ...headerCellStyle, flex: '0 0 60px' } }, '状态'),
        ]),
        ...filteredDiffs.value.map((entry) => {
          const color = COLORS[entry.type]
          const label = props.labelMap[entry.path] ?? entry.path
          return h('div', {
            key: entry.path,
            style: {
              ...rowStyle,
              background: color.bg,
              borderLeft: `3px solid ${color.border}`,
            },
          }, [
            h('div', { style: cellStyle }, label),
            h('div', { style: cellStyle }, entry.type !== 'added' ? formatValue(entry.oldValue) : '-'),
            h('div', { style: cellStyle }, entry.type !== 'removed' ? formatValue(entry.newValue) : '-'),
            h('div', { style: { ...cellStyle, flex: '0 0 60px' } }, [
              h('span', { style: { color: color.text, fontSize: '12px', fontWeight: 500 } }, TYPE_LABELS[entry.type]),
            ]),
          ])
        }),
      ])
    }
  },
})
