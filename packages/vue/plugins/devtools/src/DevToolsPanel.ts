/**
 * DevTools 浮动面板（Vue 版）
 *
 * 纯数据 props 驱动，不依赖 form 实例。
 * 使用 defineComponent + h() 渲染函数实现，功能与 React 版完全对齐。
 * 可直接复用于 Chrome Extension（数据来源改为 postMessage 即可）。
 */
import type { ISchema } from '@moluoxixi/core'
import type {
  DevToolsFilter,
  DevToolsPluginAPI,
  DevToolsTab,
  DevToolsTheme,
  EventLogEntry,
  FieldDetail,
  FieldTreeNode,
  FormOverview,
  ValueDiffEntry,
} from '@moluoxixi/plugin-devtools'
import type { PropType, VNode } from 'vue'
import {
  DEVTOOLS_FILTER_LABELS,
  DEVTOOLS_PANEL_HEIGHT,
  DEVTOOLS_PANEL_WIDTH,
  DEVTOOLS_TAB_LABELS,
  DEVTOOLS_TREE_WIDTH,
  DEVTOOLS_TYPE_CONFIG,
  filterTree,
  getDevToolsTheme,
  getSystemDarkMode,
  resolveEventColor,
  subscribeSystemDarkMode,
} from '@moluoxixi/plugin-devtools'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'

/* ======================== 纯渲染辅助函数 ======================== */

/** 渲染字段类型徽章（F/A/O/V） */
function renderTypeBadge(type: string): VNode {
  const c = DEVTOOLS_TYPE_CONFIG[type] ?? DEVTOOLS_TYPE_CONFIG.field
  return h('span', {
    style: {
      fontSize: '9px',
      fontWeight: 800,
      width: '16px',
      height: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      background: c.bg,
      color: c.c,
      flexShrink: 0,
    },
  }, c.ch)
}

/** 渲染错误指示圆点 */
function renderDot(color: string): VNode {
  return h('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    },
  })
}

/** 渲染信息徽章 */
function renderBadge(t: DevToolsTheme, label: string, color: string): VNode {
  return h('span', {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '10px',
      background: t.badgeBg,
      color,
    },
  }, label)
}

/** 渲染操作按钮（验证/重置/提交） */
function renderActionBtn(
  t: DevToolsTheme,
  label: string,
  onClick: () => void,
  color?: string,
): VNode {
  return h('button', {
    onClick,
    style: {
      background: 'none',
      border: `1px solid ${t.border}`,
      color: color ?? t.textSecondary,
      cursor: 'pointer',
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '11px',
      fontFamily: 'inherit',
      fontWeight: 500,
    },
  }, label)
}

/** 渲染 Tab 按钮 */
function renderTabBtn(
  t: DevToolsTheme,
  active: boolean,
  onClick: () => void,
  label: string,
  count?: number,
): VNode {
  return h('button', {
    onClick,
    style: {
      padding: '8px 14px',
      border: 'none',
      cursor: 'pointer',
      background: active ? t.bg : 'transparent',
      color: active ? t.accent : t.textSecondary,
      fontWeight: active ? 700 : 500,
      fontSize: '13px',
      fontFamily: 'inherit',
      borderBottom: active ? `2px solid ${t.accent}` : '2px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexShrink: 0,
    },
  }, [
    label,
    count !== undefined && count > 0
      ? h('span', {
          style: {
            fontSize: '10px',
            background: t.badgeBg,
            color: t.textDim,
            padding: '1px 5px',
            borderRadius: '8px',
          },
        }, String(count))
      : null,
  ])
}

/** 渲染过滤药丸按钮 */
function renderFilterPill(
  t: DevToolsTheme,
  active: boolean,
  onClick: () => void,
  label: string,
): VNode {
  return h('button', {
    onClick,
    style: {
      padding: '2px 10px',
      border: `1px solid ${active ? t.accent : t.border}`,
      borderRadius: '12px',
      background: active ? t.bgActive : 'transparent',
      color: active ? t.accent : t.textDim,
      cursor: 'pointer',
      fontSize: '11px',
      fontFamily: 'inherit',
      fontWeight: active ? 600 : 400,
    },
  }, label)
}

/** 渲染空状态占位 */
function renderEmpty(t: DevToolsTheme, text: string): VNode {
  return h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: t.textDim,
    },
  }, text)
}

/** 渲染只读状态药丸（pattern/required） */
function renderStatePill(
  t: DevToolsTheme,
  label: string,
  value: string | boolean,
  color: string,
): VNode {
  const display = typeof value === 'boolean' ? (value ? 'true' : 'false') : value
  return h('span', {
    style: {
      fontSize: '11px',
      padding: '2px 8px',
      borderRadius: '6px',
      background: t.badgeBg,
      color: value === false || value === 'false' ? t.textDim : color,
    },
  }, `${label}: ${display}`)
}

/** 渲染可点击切换的状态药丸（visible/disabled/preview） */
function renderTogglePill(
  t: DevToolsTheme,
  label: string,
  value: boolean,
  onClick: () => void,
): VNode {
  return h('button', {
    onClick,
    title: `点击切换 ${label}`,
    style: {
      fontSize: '11px',
      padding: '2px 8px',
      borderRadius: '6px',
      cursor: 'pointer',
      border: `1px solid ${value ? t.accent : t.border}`,
      background: value ? t.bgActive : t.badgeBg,
      color: value ? t.accent : t.textDim,
      fontWeight: value ? 600 : 400,
      fontFamily: 'inherit',
    },
  }, `${label}: ${value ? 'true' : 'false'}`)
}

/** 渲染分节标题 + 内容 */
function renderSec(t: DevToolsTheme, title: string, children: (VNode | null)[]): VNode {
  return h('div', { style: { marginBottom: '12px' } }, [
    h('div', {
      style: {
        fontSize: '11px',
        fontWeight: 700,
        color: t.textDim,
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    }, title),
    ...children,
  ])
}

/** 渲染键值行 */
function renderRow(
  t: DevToolsTheme,
  label: string,
  value: string,
  mono?: boolean,
): VNode {
  return h('div', {
    style: { display: 'flex', gap: '8px', padding: '2px 0', fontSize: '12px' },
  }, [
    h('span', {
      style: { width: '50px', flexShrink: 0, color: t.textSecondary },
    }, label),
    h('span', {
      style: {
        color: t.text,
        wordBreak: 'break-all',
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
        fontSize: mono ? '11px' : '12px',
      },
    }, value),
  ])
}

/** 渲染标题栏 */
function renderHeader(
  t: DevToolsTheme,
  overview: FormOverview,
  onClose: () => void,
  onValidate: () => void,
  onReset: () => void,
  onSubmit: () => void,
): VNode {
  return h('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: `1px solid ${t.border}`,
      background: t.bgPanel,
      flexShrink: 0,
    },
  }, [
    /* 左侧：标题 + 徽章 */
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
      h('span', {
        style: { fontWeight: 700, fontSize: '14px', color: t.accent },
      }, '⚙ DevTools'),
      renderBadge(t, `${overview.fieldCount} 字段`, t.accent),
      overview.errorFieldCount > 0
        ? renderBadge(t, `${overview.errorFieldCount} 错误`, t.red)
        : null,
      renderBadge(t, overview.pattern, t.textDim),
    ]),
    /* 右侧：操作按钮 + 关闭 */
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
      renderActionBtn(t, '验证', onValidate),
      renderActionBtn(t, '重置', onReset),
      renderActionBtn(t, '提交', onSubmit, t.accent),
      h('button', {
        onClick: onClose,
        style: {
          background: 'none',
          border: 'none',
          color: t.textDim,
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 4px',
        },
      }, '×'),
    ]),
  ])
}

/* ======================== 字段树（递归渲染） ======================== */

/** 渲染字段树视图 */
function renderTreeView(
  t: DevToolsTheme,
  nodes: FieldTreeNode[],
  selected: string | null,
  onSelect: (path: string) => void,
  depth: number = 0,
): VNode {
  return h('div', null, [
    ...nodes.map(n => h('div', { key: n.path }, [
      /* 节点行 */
      h('div', {
        /**
         * onClick：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        onClick: () => onSelect(n.path),
        title: n.path,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 8px',
          paddingLeft: `${8 + depth * 14}px`,
          cursor: 'pointer',
          background: selected === n.path ? t.bgActive : 'transparent',
          borderLeft: selected === n.path
            ? `3px solid ${t.accent}`
            : '3px solid transparent',
        },
        /**
         * onMouseenter：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
        onMouseenter: (e: MouseEvent): void => {
          if (selected !== n.path) {
            (e.currentTarget as HTMLElement).style.background = t.bgHover
          }
        },
        /**
         * onMouseleave：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
        onMouseleave: (e: MouseEvent): void => {
          if (selected !== n.path) {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
          }
        },
      }, [
        renderTypeBadge(n.type),
        h('span', {
          style: {
            flex: 1,
            fontSize: '12px',
            fontWeight: selected === n.path ? 600 : 400,
            color: n.visible ? t.text : t.textDim,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }, n.label || n.name),
        n.errorCount > 0 ? renderDot('#ef4444') : null,
        n.required
          ? h('span', {
              style: { color: t.yellow, fontSize: '11px', fontWeight: 700 },
            }, '*')
          : null,
      ]),
      /* 递归子节点 */
      n.children.length > 0
        ? renderTreeView(t, n.children, selected, onSelect, depth + 1)
        : null,
    ])),
    /* 空状态 */
    nodes.length === 0 && depth === 0
      ? renderEmpty(t, '无匹配字段')
      : null,
  ])
}

/* ======================== 字段详情组件（含编辑状态） ======================== */

/** 字段详情面板，支持编辑字段值和切换字段状态 */
const DetailViewComponent = defineComponent({
  name: 'DetailView',
  props: {
    DevToolsTheme: { type: Object as PropType<DevToolsTheme>, required: true },
    detail: { type: Object as PropType<FieldDetail>, required: true },
    api: { type: Object as PropType<DevToolsPluginAPI>, required: true },
  },
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    /** 编辑框当前输入值 */
    const editValue = ref('')
    /** 是否处于编辑模式 */
    const editing = ref(false)
    /** 最近复制成功的字段路径 */
    const copiedPath = ref('')

    /** 开始编辑字段值 */
    function startEdit(): void {
      editValue.value = JSON.stringify(props.detail.value) ?? ''
      editing.value = true
    }

    /** 应用编辑：尝试 JSON.parse，失败则当作字符串 */
    function applyEdit(): void {
      try {
        const parsed: unknown = JSON.parse(editValue.value)
        props.api.setFieldValue(props.detail.path, parsed)
      }
      catch {
        props.api.setFieldValue(props.detail.path, editValue.value)
      }
      editing.value = false
    }

    /** 复制字段路径 */
    function copyPath(): void {
      navigator.clipboard
        .writeText(props.detail.path)
        .then(() => {
          copiedPath.value = props.detail.path
          setTimeout(() => {
            if (copiedPath.value === props.detail.path) {
              copiedPath.value = ''
            }
          }, 1500)
        })
        .catch(() => { /* 剪贴板不可用时静默 */ })
    }

    return (): VNode => {
      const t = props.DevToolsTheme
      const detail = props.detail
      const api = props.api
      const isCopied = copiedPath.value === detail.path

      return h('div', { style: { padding: '14px' } }, [
        /* ---- 标题区 ---- */
        h('div', { style: { marginBottom: '12px' } }, [
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            },
          }, [
            renderTypeBadge(detail.type),
            h('span', {
              style: { fontSize: '15px', fontWeight: 700 },
            }, detail.label || detail.name),
            h('button', {
              /**
               * onClick：处理当前分支的交互与状态同步。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @returns 返回当前分支执行后的处理结果。
               */
              onClick: () => api.highlightField(detail.path),
              title: '在页面中定位',
              style: {
                background: 'none',
                border: `1px solid ${t.border}`,
                color: t.accent,
                cursor: 'pointer',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '10px',
                fontFamily: 'inherit',
              },
            }, '定位'),
            h('button', {
              onClick: copyPath,
              title: '复制字段路径',
              style: {
                background: isCopied ? t.green : 'none',
                border: `1px solid ${isCopied ? t.green : t.border}`,
                color: isCopied ? '#fff' : t.textSecondary,
                cursor: 'pointer',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '10px',
                fontFamily: 'inherit',
              },
            }, isCopied ? '已复制' : '复制路径'),
          ]),
          h('span', {
            style: { fontSize: '12px', color: t.textDim, fontFamily: 'monospace' },
          }, detail.path),
        ]),

        /* ---- 组件信息 ---- */
        renderSec(t, '组件', [
          renderRow(t, 'component', detail.component, true),
          renderRow(t, 'decorator', detail.decorator || '—', true),
        ]),

        /* ---- 状态（可切换） ---- */
        renderSec(t, '状态', [
          h('div', {
            style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' },
          }, [
            renderTogglePill(t, 'visible', detail.visible, () => api.setFieldState(detail.path, { visible: !detail.visible })),
            renderTogglePill(t, 'disabled', detail.disabled, () => api.setFieldState(detail.path, { disabled: !detail.disabled })),
            renderTogglePill(t, 'preview', detail.preview, () => api.setFieldState(detail.path, { preview: !detail.preview })),
            renderStatePill(t, 'pattern', detail.pattern, t.accent),
            renderStatePill(t, 'required', detail.required, t.red),
          ]),
        ]),

        /* ---- 数据（可编辑） ---- */
        renderSec(t, '数据', [
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            },
          }, [
            h('span', {
              style: { fontSize: '12px', color: t.textSecondary, width: '50px' },
            }, 'value'),
            /* 编辑模式：输入框 + 确定/取消 */
            editing.value
              ? h('div', { style: { flex: 1, display: 'flex', gap: '4px' } }, [
                  h('input', {
                    value: editValue.value,
                    /**
                     * onInput：处理当前分支的交互与状态同步。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param e 参数 e 为事件对象，用于提供交互上下文。
                     */
                    onInput: (e: Event): void => {
                      editValue.value = (e.target as HTMLInputElement).value
                    },
                    /**
                     * onKeydown：处理当前分支的交互与状态同步。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param e 参数 e 为事件对象，用于提供交互上下文。
                     */
                    onKeydown: (e: KeyboardEvent): void => {
                      if (e.key === 'Enter')
                        applyEdit()
                    },
                    style: {
                      flex: 1,
                      padding: '3px 8px',
                      border: `1px solid ${t.accent}`,
                      borderRadius: '4px',
                      background: t.inputBg,
                      color: t.text,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      outline: 'none',
                    },
                  }),
                  h('button', {
                    onClick: applyEdit,
                    style: {
                      background: t.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                    },
                  }, '确定'),
                  h('button', {
                    /**
                     * onClick：处理当前分支的交互与状态同步。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     */
                    onClick: (): void => { editing.value = false },
                    style: {
                      background: 'none',
                      border: `1px solid ${t.border}`,
                      color: t.textDim,
                      borderRadius: '4px',
                      padding: '3px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                    },
                  }, '取消'),
                ])
              /* 展示模式：值 + 编辑按钮 */
              : h('div', {
                  style: { flex: 1, display: 'flex', alignItems: 'center', gap: '4px' },
                }, [
                  h('span', {
                    style: { fontFamily: 'monospace', fontSize: '12px', color: t.green },
                  }, JSON.stringify(detail.value)),
                  detail.type !== 'voidField'
                    ? h('button', {
                        onClick: startEdit,
                        style: {
                          background: 'none',
                          border: `1px solid ${t.border}`,
                          color: t.textDim,
                          cursor: 'pointer',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontFamily: 'inherit',
                        },
                      }, '编辑')
                    : null,
                ]),
          ]),
          renderRow(t, 'initial', JSON.stringify(detail.initialValue) ?? '—', true),
        ]),

        /* ---- 错误列表 ---- */
        detail.errors.length > 0
          ? renderSec(t, `错误 (${detail.errors.length})`, detail.errors.map((e, i) =>
              h('div', {
                key: i,
                style: { color: t.red, fontSize: '12px', padding: '2px 0' },
              }, `• ${e.message}`),
            ))
          : null,

        /* ---- 警告列表 ---- */
        detail.warnings.length > 0
          ? renderSec(t, `警告 (${detail.warnings.length})`, detail.warnings.map((e, i) =>
              h('div', {
                key: i,
                style: { color: t.yellow, fontSize: '12px', padding: '2px 0' },
              }, `• ${e.message}`),
            ))
          : null,
      ])
    }
  },
})

/* ======================== 事件视图 ======================== */

/** 渲染事件时间线列表 */
function renderEventsView(
  t: DevToolsTheme,
  events: EventLogEntry[],
  onClear: () => void,
): VNode {
  /* 倒序排列，最新事件在顶部 */
  const reversed = [...events].reverse()

  return h('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' },
  }, [
    /* 顶部：事件计数 + 清空按钮 */
    h('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        borderBottom: `1px solid ${t.border}`,
        background: t.bgPanel,
        flexShrink: 0,
      },
    }, [
      h('span', { style: { color: t.textDim, fontSize: '12px' } }, `${events.length} 条事件`),
      h('button', {
        onClick: onClear,
        style: {
          background: 'none',
          border: `1px solid ${t.border}`,
          color: t.textSecondary,
          cursor: 'pointer',
          borderRadius: '4px',
          padding: '2px 10px',
          fontSize: '11px',
          fontFamily: 'inherit',
        },
      }, '清空'),
    ]),
    /* 事件列表 */
    h('div', { style: { flex: 1, overflow: 'auto' } }, [
      ...reversed.map(ev =>
        h('div', {
          key: ev.id,
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '4px 12px',
            borderBottom: `1px solid ${t.border}10`,
            fontSize: '12px',
          },
        }, [
          /* 时间戳 */
          h('span', {
            style: {
              color: t.textDim,
              flexShrink: 0,
              fontSize: '11px',
              fontFamily: 'monospace',
            },
          }, new Date(ev.timestamp).toLocaleTimeString('zh-CN', { hour12: false })),
          /* 字段路径徽章 */
          ev.fieldPath
            ? h('span', {
                style: {
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: t.badgeBg,
                  color: t.accent,
                  fontFamily: 'monospace',
                  flexShrink: 0,
                },
              }, ev.fieldPath)
            : null,
          /* 事件摘要（按类型着色） */
          h('span', {
            style: {
              color: resolveEventColor(ev.type, t),
              flex: 1,
            },
          }, ev.summary),
        ]),
      ),
      events.length === 0 ? renderEmpty(t, '暂无事件') : null,
    ]),
  ])
}

/* ======================== Diff 视图 ======================== */

/** 渲染值 Diff 视图（当前值 vs 初始值） */
function renderDiffView(t: DevToolsTheme, diff: ValueDiffEntry[]): VNode {
  const changed = diff.filter(d => d.changed)

  return h('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' },
  }, [
    /* 顶部：修改计数 */
    h('div', {
      style: {
        padding: '6px 12px',
        borderBottom: `1px solid ${t.border}`,
        background: t.bgPanel,
        flexShrink: 0,
      },
    }, [
      h('span', { style: { color: t.textDim, fontSize: '12px' } }, `${changed.length} / ${diff.length} 个字段已修改`),
    ]),
    /* Diff 列表 */
    h('div', { style: { flex: 1, overflow: 'auto' } }, [
      ...diff.map(d =>
        h('div', {
          key: d.path,
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '5px 12px',
            borderBottom: `1px solid ${t.border}15`,
            background: d.changed ? `${t.yellow}08` : 'transparent',
          },
        }, [
          /* 字段名 */
          h('span', {
            style: {
              width: '120px',
              flexShrink: 0,
              fontSize: '12px',
              fontWeight: d.changed ? 600 : 400,
              color: d.changed ? t.text : t.textDim,
            },
          }, d.label || d.path),
          /* 初始值（修改时加删除线） */
          h('span', {
            style: {
              fontSize: '11px',
              fontFamily: 'monospace',
              color: t.red,
              textDecoration: d.changed ? 'line-through' : 'none',
              opacity: d.changed ? 0.6 : 0.3,
              flexShrink: 0,
              minWidth: '60px',
            },
          }, JSON.stringify(d.initialValue)),
          /* 箭头 + 当前值（仅修改时显示） */
          d.changed
            ? h('span', { style: { color: t.textDim } }, '→')
            : null,
          d.changed
            ? h('span', {
                style: {
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: t.green,
                  fontWeight: 600,
                },
              }, JSON.stringify(d.currentValue))
            : null,
        ]),
      ),
      diff.length === 0 ? renderEmpty(t, '暂无字段') : null,
    ]),
  ])
}

/* ======================== 数据视图组件（含复制状态） ======================== */

/** JSON 数据视图，支持一键复制 */
const ValuesViewComponent = defineComponent({
  name: 'ValuesView',
  props: {
    DevToolsTheme: { type: Object as PropType<DevToolsTheme>, required: true },
    values: { type: Object as PropType<Record<string, unknown>>, required: true },
  },
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    /** 是否已复制到剪贴板 */
    const copied = ref(false)

    /** 格式化后的 JSON 字符串 */
    const json = computed((): string => JSON.stringify(props.values, null, 2))

    /** 复制 JSON 到剪贴板 */
    function handleCopy(): void {
      navigator.clipboard.writeText(json.value)
        .then(() => {
          copied.value = true
          setTimeout(() => {
            copied.value = false
          }, 1500)
        })
        .catch(() => { /* 剪贴板 API 不可用时静默忽略 */ })
    }

    return (): VNode => {
      const t = props.DevToolsTheme

      return h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        },
      }, [
        /* 顶部：复制按钮 */
        h('div', {
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '6px 12px',
            borderBottom: `1px solid ${t.border}`,
            background: t.bgPanel,
            flexShrink: 0,
          },
        }, [
          h('button', {
            onClick: handleCopy,
            style: {
              background: copied.value ? t.green : 'none',
              border: `1px solid ${copied.value ? t.green : t.border}`,
              color: copied.value ? '#fff' : t.textSecondary,
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '2px 12px',
              fontSize: '11px',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            },
          }, copied.value ? '已复制 ✓' : '复制 JSON'),
        ]),
        /* JSON 内容 */
        h('pre', {
          style: {
            flex: 1,
            margin: 0,
            padding: '12px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: 1.7,
            fontFamily: 'ui-monospace, monospace',
            color: t.green,
            background: t.bg,
          },
        }, json.value),
      ])
    }
  },
})

/* ======================== 主面板组件 ======================== */

/** DevTools 浮动面板主组件 */
const DevToolsPanelView = defineComponent({
  name: 'DevToolsPanelView',
  props: {
    api: {
      type: Object as PropType<DevToolsPluginAPI>,
      required: true,
    },
  },
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    /* ---- 系统主题跟随 ---- */
    const isDark = ref(getSystemDarkMode())

    onMounted(() => {
      const dispose = subscribeSystemDarkMode((value) => {
        isDark.value = value
      })
      onUnmounted(dispose)
    })

    const DevToolsTheme = computed<DevToolsTheme>(() => getDevToolsTheme(isDark.value))

    /* ---- 面板 UI 状态 ---- */
    /** 面板是否展开 */
    const visible = ref(false)
    /** 当前激活的 Tab */
    const tab = ref<DevToolsTab>('tree')
    /** 当前选中的字段路径 */
    const selected = ref<string | null>(null)
    /** 搜索关键词 */
    const search = ref('')
    /** 过滤器类型 */
    const filter = ref<DevToolsFilter>('all')
    /** 数据版本号，API subscribe 回调时递增以触发 computed 重算 */
    const tick = ref(0)

    /* ---- 订阅数据变化 ---- */
    onMounted(() => {
      const unsubscribe = props.api.subscribe(() => {
        tick.value++
      })
      onUnmounted(unsubscribe)
    })

    /* ---- 派生数据（通过 tick + UI 状态触发重算） ---- */
    /** 字段树数据 */
    const tree = computed((): FieldTreeNode[] => {
      if (!visible.value || tab.value !== 'tree') {
        return []
      }
      return props.api.getFieldTree()
    })

    /** 表单概览数据 */
    const overview = computed((): FormOverview => {
      void tick.value
      void visible.value
      return props.api.getFormOverview()
    })

    /** 事件日志 */
    const events = computed((): EventLogEntry[] => {
      if (!visible.value || tab.value !== 'events') {
        return []
      }
      return props.api.getEventLog()
    })

    /** 当前选中字段的详情 */
    const detail = computed((): FieldDetail | null => {
      if (!visible.value || tab.value !== 'tree' || !selected.value) {
        return null
      }
      void tick.value
      return props.api.getFieldDetail(selected.value)
    })

    /** 值 Diff 数据 */
    const diff = computed((): ValueDiffEntry[] => {
      if (!visible.value || (tab.value !== 'diff' && tab.value !== 'tree')) {
        return []
      }
      return props.api.getValueDiff()
    })

    /** 过滤后的字段树 */
    const filteredTree = computed((): FieldTreeNode[] => {
      if (!search.value && filter.value === 'all')
        return tree.value
      return filterTree(tree.value, search.value, filter.value, diff.value)
    })

    /* ---- 渲染 ---- */
    return (): VNode => {
      const t = DevToolsTheme.value
      const ov = overview.value

      /* ===== 未展开时：浮动触发按钮 ===== */
      if (!visible.value) {
        return h('button', {
          /**
           * onClick：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
          onClick: (): void => { visible.value = true },
          title: 'ConfigForm DevTools',
          style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '20px',
            background: t.accent,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        }, [
          h('span', { style: { fontSize: '15px' } }, '⚙'),
          ' DevTools',
          ov.errorFieldCount > 0
            ? h('span', {
                style: {
                  background: '#ef4444',
                  borderRadius: '8px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                },
              }, String(ov.errorFieldCount))
            : null,
        ])
      }

      /* ===== 展开后：面板主体 ===== */
      return h('div', {
        style: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          width: `${DEVTOOLS_PANEL_WIDTH}px`,
          height: `${DEVTOOLS_PANEL_HEIGHT}px`,
          background: t.bg,
          color: t.text,
          borderRadius: '12px',
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          overflow: 'hidden',
        },
      }, [
        /* ---- 标题栏 ---- */
        renderHeader(
          t,
          ov,
          () => { visible.value = false },
          () => { props.api.validateAll() },
          () => { props.api.resetForm() },
          () => { props.api.submitForm() },
        ),

        /* ---- Tab 栏 + 搜索框 ---- */
        h('div', {
          style: {
            display: 'flex',
            borderBottom: `1px solid ${t.border}`,
            background: t.bgPanel,
            flexShrink: 0,
          },
        }, [
          ...(['tree', 'events', 'diff', 'values'] as DevToolsTab[]).map(tb =>
            renderTabBtn(
              t,
              tab.value === tb,
              () => {
                tab.value = tb
                selected.value = null
              },
              DEVTOOLS_TAB_LABELS[tb],
              tb === 'events'
                ? events.value.length
                : tb === 'diff'
                  ? diff.value.filter(d => d.changed).length
                  : undefined,
            ),
          ),
          /* 搜索框（仅字段 Tab 显示） */
          tab.value === 'tree'
            ? h('input', {
                value: search.value,
                /**
                 * onInput：处理当前分支的交互与状态同步。
                 * 功能：处理参数消化、状态变更与调用链行为同步。
                 * @param e 参数 e 为事件对象，用于提供交互上下文。
                 */
                onInput: (e: Event): void => {
                  search.value = (e.target as HTMLInputElement).value
                },
                placeholder: '搜索字段或路径...',
                style: {
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0 10px',
                  background: 'transparent',
                  color: t.text,
                  fontSize: '12px',
                  fontFamily: 'inherit',
                },
              })
            : null,
        ]),

        /* ---- 过滤栏（仅字段 Tab） ---- */
        tab.value === 'tree'
          ? h('div', {
              style: {
                display: 'flex',
                gap: '4px',
                padding: '4px 8px',
                borderBottom: `1px solid ${t.border}`,
                background: t.bgPanel,
              },
            }, (['all', 'error', 'required', 'modified'] as const).map(f =>
              renderFilterPill(
                t,
                filter.value === f,
                () => { filter.value = f },
                DEVTOOLS_FILTER_LABELS[f],
              ),
            ))
          : null,

        /* ---- 内容区 ---- */
        h('div', {
          style: { flex: 1, overflow: 'hidden', display: 'flex' },
        }, [
          /* 字段 Tab：左右分栏 */
          tab.value === 'tree'
            ? [
                /* 左侧：字段树 */
                h('div', {
                  style: {
                    width: `${DEVTOOLS_TREE_WIDTH}px`,
                    flexShrink: 0,
                    overflow: 'auto',
                    borderRight: `1px solid ${t.border}`,
                  },
                }, [
                  renderTreeView(
                    t,
                    filteredTree.value,
                    selected.value,
                    (p: string): void => {
                      selected.value = p
                      props.api.highlightField(p)
                    },
                  ),
                ]),
                /* 右侧：字段详情 */
                h('div', { style: { flex: 1, overflow: 'auto' } }, [
                  detail.value
                    ? h(DetailViewComponent, {
                        DevToolsTheme: t,
                        detail: detail.value,
                        api: props.api,
                      })
                    : renderEmpty(t, '点击字段查看详情'),
                ]),
              ]
            : null,

          /* 事件 Tab */
          tab.value === 'events'
            ? renderEventsView(t, events.value, () => { props.api.clearEventLog() })
            : null,

          /* Diff Tab */
          tab.value === 'diff'
            ? renderDiffView(t, diff.value)
            : null,

          /* 数据 Tab */
          tab.value === 'values'
            ? h(ValuesViewComponent, { DevToolsTheme: t, values: ov.values })
            : null,
        ]),
      ])
    }
  },
})

/** DevTools 面板入口：通过 Schema 渲染注册组件 */
export const DevToolsPanel = defineComponent({
  name: 'DevToolsPanel',
  props: {
    api: {
      type: Object as PropType<DevToolsPluginAPI>,
      required: true,
    },
  },
  setup(props) {
    const form = useCreateForm()
    const schema = computed<ISchema>(() => ({
      type: 'object',
      properties: {
        panel: {
          type: 'void',
          component: 'DevToolsPanelView',
          componentProps: { api: props.api },
        },
      },
    }))
    const components = { DevToolsPanelView }

    return () => h(FormProvider, {
      form,
      components,
    }, () => h(SchemaField, { schema: schema.value }))
  },
})
