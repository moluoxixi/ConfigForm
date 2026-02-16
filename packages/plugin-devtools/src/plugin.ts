import type { FieldInstance, FormEvent, FormInstance, FormPlugin, VoidFieldInstance } from '@moluoxixi/core'
import type {
  DevToolsEventType,
  DevToolsGlobalHook,
  DevToolsPluginAPI,
  EventLogEntry,
  FieldDetail,
  FieldTreeNode,
  FormOverview,
  ValueDiffEntry,
} from './types'
import { FormLifeCycle, FormPath } from '@moluoxixi/core'
import {
  buildDevToolsFieldEventSummary,
  DEVTOOLS_FIELD_EVENT_DEFINITIONS,
  DEVTOOLS_FORM_EVENT_DEFINITIONS,
} from './events'

/** 插件配置 */
export interface DevToolsPluginConfig {
  /** 事件日志最大条数（默认 200） */
  maxEventLog?: number
  /** 是否注册到全局 Hook（默认 true，为 Chrome Extension 预留） */
  globalHook?: boolean
  /** 表单标识（多表单时区分，默认自增 ID） */
  formId?: string
}

/** 全局表单 ID 自增 */
let globalFormIdCounter = 0

/**
 * DevTools 插件
 *
 * 安装到 form 后自动采集：
 * - 字段树（实时构建）
 * - 事件日志（时间线）
 * - 表单值变化
 *
 * 暴露 DevToolsPluginAPI 供浮动面板或 Chrome Extension 读取。
 *
 * @example
 * ```ts
 * import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
 *
 * const form = createForm({
 *   plugins: [devToolsPlugin()],
 * })
 *
 * // 浮动面板通过 form.getPlugin('devtools') 获取 API
 * const api = form.getPlugin<DevToolsPluginAPI>('devtools')
 * ```
 */
export function devToolsPlugin(config: DevToolsPluginConfig = {}): FormPlugin<DevToolsPluginAPI> {
  const {
    maxEventLog = 200,
    globalHook = true,
    formId = `form-${++globalFormIdCounter}`,
  } = config

  return {
    name: 'devtools',

    install(form: FormInstance) {
      /** 事件日志 */
      const eventLog: EventLogEntry[] = []
      let eventIdCounter = 0

      /** 数据变化监听器 */
      const listeners = new Set<() => void>()
      /** 字段创建顺序（跨 field / voidField 统一） */
      const fieldOrder = new Map<string, number>()
      let fieldOrderCounter = 0
      let fieldTreeDirty = true
      let formOverviewDirty = true
      let valueDiffDirty = true
      let fieldTreeCache: FieldTreeNode[] = []
      let formOverviewCache: FormOverview | null = null
      let valueDiffCache: ValueDiffEntry[] = []

      function invalidateDataCaches(): void {
        fieldTreeDirty = true
        formOverviewDirty = true
        valueDiffDirty = true
      }

      /** 通知数据变化 */
      function notify(): void {
        for (const listener of listeners) {
          try {
            listener()
          }
          catch { /* 静默 */ }
        }
      }

      /** 添加事件日志 */
      function addEvent(type: DevToolsEventType, summary: string, fieldPath?: string): void {
        invalidateDataCaches()
        eventLog.push({
          id: ++eventIdCounter,
          type,
          timestamp: Date.now(),
          fieldPath,
          summary,
        })
        /* 超出上限时移除最早的 */
        while (eventLog.length > maxEventLog) {
          eventLog.shift()
        }
        notify()
      }

      /* ======================== 事件监听 ======================== */

      const disposers: Array<() => void> = []

      /**
       * 监听表单事件
       *
       * 事件回调签名为 (event: FormEvent) => void，
       * event.payload 为载荷（Form 事件传 form，Field 事件传 field）。
       */
      for (const { type: event, label } of DEVTOOLS_FORM_EVENT_DEFINITIONS) {
        disposers.push(form.on(event, () => {
          addEvent(event, label)
        }))
      }

      /** 监听字段事件（payload 为 FieldInstance） */
      for (const { type: event } of DEVTOOLS_FIELD_EVENT_DEFINITIONS) {
        disposers.push(form.on(event, (e: FormEvent) => {
          const field = e.payload as FieldInstance
          if (field?.path) {
            if (event === FormLifeCycle.ON_FIELD_INIT) {
              const key = normalizePathKey(field.path)
              if (!fieldOrder.has(key)) {
                fieldOrder.set(key, ++fieldOrderCounter)
              }
            }
            addEvent(event, buildDevToolsFieldEventSummary(event, field), field.path)
          }
        }))
      }

      /* ======================== 字段树构建 ======================== */

      /** 从 field path 判断字段类型 */
      function getFieldType(path: string): FieldTreeNode['type'] {
        if (form.getArrayField(path))
          return 'arrayField'
        if (form.getObjectField(path))
          return 'objectField'
        if (form.getAllVoidFields().has(path))
          return 'voidField'
        return 'field'
      }

      /** 序列化单个字段为树节点 */
      function serializeField(field: FieldInstance | VoidFieldInstance, type: FieldTreeNode['type']): FieldTreeNode {
        const isVoid = type === 'voidField'
        const dataField = isVoid ? null : field as FieldInstance

        return {
          path: field.path,
          name: field.name,
          type,
          label: field.label || field.name,
          component: typeof field.component === 'string' ? field.component : '(custom)',
          pattern: field.pattern,
          visible: field.visible,
          disabled: field.disabled,
          preview: field.preview,
          required: isVoid ? false : dataField!.required,
          mounted: field.mounted,
          value: isVoid ? undefined : safeSerialize(dataField!.value),
          errorCount: isVoid ? 0 : dataField!.errors.length,
          warningCount: isVoid ? 0 : dataField!.warnings.length,
          children: [],
        }
      }

      /** 构建字段树 */
      function buildFieldTree(): FieldTreeNode[] {
        const nodeMap = new Map<string, FieldTreeNode>()
        const roots: FieldTreeNode[] = []

        /* 收集所有数据字段 */
        const allFields = form.getAllFields()
        for (const [path, field] of allFields) {
          const key = normalizePathKey(path)
          const type = getFieldType(path)
          if (!nodeMap.has(key)) {
            nodeMap.set(key, serializeField(field as FieldInstance, type))
            if (!fieldOrder.has(key)) {
              fieldOrder.set(key, ++fieldOrderCounter)
            }
          }
        }

        /* 收集所有虚拟字段 */
        const allVoidFields = form.getAllVoidFields()
        for (const [path, field] of allVoidFields) {
          const key = normalizePathKey(path)
          if (!nodeMap.has(key)) {
            nodeMap.set(key, serializeField(field as unknown as VoidFieldInstance, 'voidField'))
            if (!fieldOrder.has(key)) {
              fieldOrder.set(key, ++fieldOrderCounter)
            }
          }
        }

        /**
         * 按字段创建顺序构建树（最贴近 Schema 声明顺序），
         * 兜底再按路径自然序。
         */
        const sortedKeys = Array.from(nodeMap.keys()).sort((a, b) => {
          const orderA = fieldOrder.get(a)
          const orderB = fieldOrder.get(b)
          if (orderA !== undefined && orderB !== undefined && orderA !== orderB) {
            return orderA - orderB
          }
          if (orderA !== undefined && orderB === undefined)
            return -1
          if (orderA === undefined && orderB !== undefined)
            return 1
          return comparePathKey(a, b)
        })
        for (const key of sortedKeys) {
          const node = nodeMap.get(key)!
          const parentKey = getParentPath(key)

          if (parentKey && nodeMap.has(parentKey)) {
            nodeMap.get(parentKey)!.children.push(node)
          }
          else {
            roots.push(node)
          }
        }

        return roots
      }

      /* ======================== 字段详情 ======================== */

      function getFieldDetailImpl(path: string): FieldDetail | null {
        const field = form.getField(path) as FieldInstance | undefined
        const voidField = form.getAllVoidFields().get(path)

        if (!field && !voidField)
          return null

        if (voidField && !field) {
          return {
            path: voidField.path,
            name: voidField.name,
            label: voidField.label,
            type: 'voidField',
            component: typeof voidField.component === 'string' ? voidField.component : '(custom)',
            decorator: '',
            pattern: voidField.pattern,
            selfPattern: voidField.selfPattern,
            visible: voidField.visible,
            disabled: voidField.disabled,
            preview: voidField.preview,
            mounted: voidField.mounted,
            value: undefined,
            initialValue: undefined,
            required: false,
            errors: [],
            warnings: [],
            dataSource: [],
            dataSourceLoading: false,
            componentProps: {},
            decoratorProps: {},
          }
        }

        const f = field!
        return {
          path: f.path,
          name: f.name,
          label: f.label,
          type: getFieldType(f.path),
          component: typeof f.component === 'string' ? f.component : '(custom)',
          decorator: typeof f.decorator === 'string' ? f.decorator : '(custom)',
          pattern: f.pattern,
          selfPattern: f.selfPattern,
          visible: f.visible,
          disabled: f.disabled,
          preview: f.preview,
          mounted: f.mounted,
          value: safeSerialize(f.value),
          initialValue: safeSerialize(f.initialValue),
          required: f.required,
          errors: f.errors.map(e => ({ path: e.path, message: e.message })),
          warnings: f.warnings.map(e => ({ path: e.path, message: e.message })),
          dataSource: f.dataSource?.map(d => ({ label: d.label, value: d.value })) ?? [],
          dataSourceLoading: f.dataSourceLoading,
          componentProps: safeSerialize(f.componentProps) as Record<string, unknown>,
          decoratorProps: safeSerialize(f.decoratorProps) as Record<string, unknown>,
        }
      }

      /* ======================== API ======================== */

      const api: DevToolsPluginAPI = {
        /* ---- 只读查询 ---- */
        getFieldTree(): FieldTreeNode[] {
          if (fieldTreeDirty) {
            fieldTreeCache = buildFieldTree()
            fieldTreeDirty = false
          }
          return fieldTreeCache
        },
        getFieldDetail: getFieldDetailImpl,
        getFormOverview(): FormOverview {
          if (formOverviewDirty || !formOverviewCache) {
            const allFields = form.getAllFields()
            let errorCount = 0
            for (const [, field] of allFields) {
              if ((field as FieldInstance).errors?.length > 0)
                errorCount++
            }
            formOverviewCache = {
              pattern: form.pattern,
              fieldCount: allFields.size,
              errorFieldCount: errorCount,
              values: safeSerialize(form.values) as Record<string, unknown>,
              initialValues: safeSerialize(form.initialValues) as Record<string, unknown>,
              submitting: form.submitting,
              validating: form.validating,
            }
            formOverviewDirty = false
          }
          return formOverviewCache
        },
        getEventLog: () => [...eventLog],
        getValueDiff(): ValueDiffEntry[] {
          if (valueDiffDirty) {
            const diff: ValueDiffEntry[] = []
            const allFields = form.getAllFields()
            for (const [path, field] of allFields) {
              const f = field as FieldInstance
              const current = safeSerialize(f.value)
              const initial = safeSerialize(f.initialValue)
              const changed = JSON.stringify(current) !== JSON.stringify(initial)
              diff.push({ path, label: f.label || f.name, currentValue: current, initialValue: initial, changed })
            }
            valueDiffCache = diff
            valueDiffDirty = false
          }
          return valueDiffCache
        },
        subscribe(listener: () => void): () => void {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },

        /* ---- 调试操作 ---- */
        clearEventLog(): void {
          eventLog.length = 0
          eventIdCounter = 0
          notify()
        },
        highlightField(path: string): void {
          const el = resolveFieldElement(form, path)
          if (!el) {
            addEvent('devtools:locate-miss', `定位失败: ${path}`, path)
            return
          }
          flashFieldElement(el)
          addEvent('devtools:locate', `定位字段: ${path}`, path)
        },
        setFieldValue(path: string, value: unknown): void {
          const field = form.getField(path) as FieldInstance | undefined
          if (field) {
            field.setValue(value)
            addEvent('devtools:setValue', `手动赋值: ${path} = ${JSON.stringify(value)?.slice(0, 50)}`, path)
          }
        },
        setFieldState(path: string, state: Partial<{ visible: boolean, disabled: boolean, preview: boolean, pattern: string }>): void {
          const field = form.getField(path) as FieldInstance | undefined
          if (!field)
            return
          if (state.visible !== undefined)
            field.display = state.visible ? 'visible' : 'none'
          if (state.disabled !== undefined)
            field.disabled = state.disabled
          if (state.preview !== undefined)
            field.preview = state.preview
          if (state.pattern !== undefined)
            field.selfPattern = state.pattern as FieldInstance['selfPattern']
          addEvent('devtools:setState', `修改状态: ${path} → ${JSON.stringify(state)}`, path)
        },
        async validateAll(): Promise<Array<{ path: string, message: string }>> {
          const result = await form.validate()
          const errors = result.errors.map(e => ({ path: e.path, message: e.message }))
          addEvent('devtools:validate', `手动验证: ${errors.length} 个错误`)
          return errors
        },
        resetForm(): void {
          form.reset()
          addEvent('devtools:reset', '手动重置表单')
        },
        async submitForm(): Promise<{ success: boolean, errors: Array<{ path: string, message: string }> }> {
          const result = await form.submit()
          const errors = result.errors.map(e => ({ path: e.path, message: e.message }))
          addEvent('devtools:submit', `手动提交: ${errors.length > 0 ? `${errors.length} 个错误` : '成功'}`)
          return { success: errors.length === 0, errors }
        },
      }

      /* ======================== 全局 Hook（为 Extension 预留） ======================== */

      if (globalHook && typeof window !== 'undefined') {
        const hook = ensureGlobalHook()
        hook.register(formId, api)
        disposers.push(() => hook.unregister(formId))
      }

      /* 记录初始化事件 */
      addEvent('devtools:init', `DevTools 已连接 (${formId})`)

      return {
        api,
        dispose: () => {
          for (const d of disposers) {
            d()
          }
          disposers.length = 0
          listeners.clear()
          eventLog.length = 0
        },
      }
    },
  }
}

/* ======================== 工具函数 ======================== */

/** 获取父路径（a.b.c → a.b） */
function getParentPath(path: string): string {
  const segments = path.split('.')
  if (segments.length <= 1)
    return ''
  return segments.slice(0, -1).join('.')
}

/** 归一化路径键（统一 a[0].b 与 a.0.b） */
function normalizePathKey(path: string): string {
  return FormPath.parse(path).map(seg => String(seg)).join('.')
}

/**
 * 路径排序（分段自然序）
 *
 * 规则：
 * - 按 segment 逐段比较（数字按数值）
 * - 前缀相同则父路径在前（a.b < a.b.c）
 */
function comparePathKey(a: string, b: string): number {
  const aSegments = a.split('.')
  const bSegments = b.split('.')
  const length = Math.min(aSegments.length, bSegments.length)
  for (let i = 0; i < length; i++) {
    const segA = aSegments[i]
    const segB = bSegments[i]
    if (segA === segB)
      continue
    const numA = Number(segA)
    const numB = Number(segB)
    const aNumeric = Number.isInteger(numA) && String(numA) === segA
    const bNumeric = Number.isInteger(numB) && String(numB) === segB
    if (aNumeric && bNumeric) {
      return numA - numB
    }
    return segA.localeCompare(segB, undefined, { numeric: true, sensitivity: 'base' })
  }
  return aSegments.length - bSegments.length
}

/** 安全序列化（避免循环引用和函数） */
function safeSerialize(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value, (_key, val) => {
      if (typeof val === 'function')
        return '(function)'
      if (val instanceof RegExp)
        return val.toString()
      if (val instanceof Date)
        return val.toISOString()
      return val
    }))
  }
  catch {
    return String(value)
  }
}

/** 定位字段对应的 DOM 元素（优先 domRef，兜底 data-field-path 查询） */
function resolveFieldElement(form: FormInstance, path: string): HTMLElement | null {
  const field = form.getField(path) as FieldInstance | undefined
  if (field?.domRef) {
    return field.domRef
  }

  if (typeof document === 'undefined') {
    return null
  }

  const normalizedPath = normalizePathKey(path)
  const bracketPath = FormPath.stringify(FormPath.parse(path))
  const candidates = Array.from(new Set([path, normalizedPath, bracketPath])).filter(Boolean)

  for (const candidate of candidates) {
    const escaped = escapeSelectorAttrValue(candidate)
    const exact = document.querySelector(
      `[data-field-path="${escaped}"], [name="${escaped}"]`,
    ) as HTMLElement | null
    if (exact) {
      return exact
    }
  }

  /**
   * void/container 节点通常没有自己的 data-field-path，
   * 兜底定位到第一个后代数据字段。
   */
  for (const candidate of candidates) {
    const escaped = escapeSelectorAttrValue(candidate)
    const descendant = document.querySelector(
      `[data-field-path^="${escaped}."], [data-field-path^="${escaped}["]`,
    ) as HTMLElement | null
    if (descendant) {
      return descendant
    }
  }

  return null
}

/** 对 attribute selector 值做最小转义（引号与反斜杠） */
function escapeSelectorAttrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/** 滚动并闪烁高亮元素 */
function flashFieldElement(el: HTMLElement): void {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const prevOutline = el.style.outline
  const prevOutlineOffset = el.style.outlineOffset
  const prevTransition = el.style.transition

  el.style.outline = '2px solid #3b82f6'
  el.style.outlineOffset = '2px'
  el.style.transition = 'outline-color 0.3s'

  setTimeout(() => {
    el.style.outline = '2px solid #ef4444'
    setTimeout(() => {
      el.style.outline = '2px solid #3b82f6'
      setTimeout(() => {
        el.style.outline = prevOutline
        el.style.outlineOffset = prevOutlineOffset
        el.style.transition = prevTransition
      }, 300)
    }, 300)
  }, 300)
}

/** 确保全局 Hook 存在 */
function ensureGlobalHook(): DevToolsGlobalHook {
  const globalObj = window as unknown as Record<string, unknown>
  if (!globalObj.__CONFIGFORM_DEVTOOLS_HOOK__) {
    const listeners = new Set<(forms: Map<string, DevToolsPluginAPI>) => void>()
    const hook: DevToolsGlobalHook = {
      forms: new Map(),
      register(id, api) {
        hook.forms.set(id, api)
        for (const fn of listeners) fn(hook.forms)
      },
      unregister(id) {
        hook.forms.delete(id)
        for (const fn of listeners) fn(hook.forms)
      },
      onChange(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    }
    globalObj.__CONFIGFORM_DEVTOOLS_HOOK__ = hook
  }
  return globalObj.__CONFIGFORM_DEVTOOLS_HOOK__ as DevToolsGlobalHook
}
