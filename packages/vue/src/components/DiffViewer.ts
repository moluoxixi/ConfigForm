import type { DiffFieldView, DiffType } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'

/**
 * Diff Viewer Props：类型接口定义。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DiffViewerProps {
  diffs: DiffFieldView[]
  labelMap?: Record<string, string>
  onlyDirty?: boolean
}

/**
 * COLORS：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const COLORS: Record<DiffType, { bg: string, text: string, border: string }> = {
  added: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  removed: { bg: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  changed: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  unchanged: { bg: '#fff', text: '#999', border: '#f0f0f0' },
}

/**
 * TYPE LABELS：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const TYPE_LABELS: Record<DiffType, string> = {
  added: '新增',
  removed: '删除',
  changed: '变更',
  unchanged: '未变',
}

/**
 * container Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const containerStyle: Record<string, string> = {
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  overflow: 'hidden',
  fontSize: '14px',
}

/**
 * header Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const headerStyle: Record<string, string> = {
  display: 'flex',
  background: '#fafafa',
  borderBottom: '1px solid #e8e8e8',
  fontWeight: '600',
  color: '#333',
}

/**
 * header Cell Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const headerCellStyle: Record<string, string> = {
  flex: '1',
  padding: '10px 12px',
}

/**
 * row Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const rowStyle: Record<string, string> = {
  display: 'flex',
  borderBottom: '1px solid #f0f0f0',
}

/**
 * cell Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const cellStyle: Record<string, string> = {
  flex: '1',
  padding: '8px 12px',
  wordBreak: 'break-all',
}

/**
 * empty Style：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const emptyStyle: Record<string, string> = {
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  background: '#fafafa',
  borderRadius: '8px',
  border: '1px dashed #d9d9d9',
}

/**
 * format Value：当前功能模块的核心执行单元。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function formatValue(value: unknown): string {
  if (value === undefined || value === null)
    return '-'
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}

/**
 * Diff Viewer：变量或常量声明。
 * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
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
      /**
       * default：执行当前功能逻辑。
       *
       * @returns 返回当前功能的处理结果。
       */

      default: () => ({}),
    },
    onlyDirty: {
      type: Boolean,
      default: true,
    },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/DiffViewer.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
