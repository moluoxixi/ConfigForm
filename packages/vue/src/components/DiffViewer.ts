import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'

export interface DiffViewerProps {
  diffs: DiffFieldView[]
  labelMap?: Record<string, string>
  onlyDirty?: boolean
}

const COLORS: Record<DiffType, { bg: string, text: string, border: string }> = {
  added: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  removed: { bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  changed: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  unchanged: { bg: '#fff', text: '#999', border: '#f0f0f0' },
}

const TYPE_LABELS: Record<DiffType, string> = {
  added: '新增',
  removed: '删除',
  changed: '变更',
  unchanged: '未变',
}

const containerStyle: Record<string, string> = {
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  overflow: 'hidden',
  fontSize: '14px',
}

const headerStyle: Record<string, string> = {
  display: 'flex',
  background: '#fafafa',
  borderBottom: '1px solid #e8e8e8',
  fontWeight: '600',
  color: '#333',
}

const headerCellStyle: Record<string, string> = {
  flex: '1',
  padding: '10px 12px',
}

const rowStyle: Record<string, string> = {
  display: 'flex',
  borderBottom: '1px solid #f0f0f0',
}

const cellStyle: Record<string, string> = {
  flex: '1',
  padding: '8px 12px',
  wordBreak: 'break-all',
}

const emptyStyle: Record<string, string> = {
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  background: '#fafafa',
  borderRadius: '8px',
  border: '1px dashed #d9d9d9',
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null)
    return '-'
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}

export const DiffViewer = defineComponent({
  name: 'DiffViewer',
  props: {
    diffs: {
      type: Array as PropType<DiffFieldView[]>,
      required: true,
    },
    labelMap: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    onlyDirty: {
      type: Boolean,
      default: true,
    },
  },
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
