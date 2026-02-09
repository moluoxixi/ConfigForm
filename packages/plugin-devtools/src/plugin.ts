import type { FieldInstance, FormInstance, FormPlugin, VoidFieldInstance } from '@moluoxixi/core'
import type { FormEvent } from '@moluoxixi/core'
import type { DevToolsGlobalHook, DevToolsPluginAPI, EventLogEntry, FieldDetail, FieldTreeNode, FormOverview, ValueDiffEntry } from './types'
import { FormLifeCycle } from '@moluoxixi/core'

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

    install(form: FormInstance): DevToolsPluginAPI {
      /** 事件日志 */
      const eventLog: EventLogEntry[] = []
      let eventIdCounter = 0

      /** 数据变化监听器 */
      const listeners = new Set<() => void>()

      /** 通知数据变化 */
      function notify(): void {
        for (const listener of listeners) {
          try { listener() } catch { /* 静默 */ }
        }
      }

      /** 添加事件日志 */
      function addEvent(type: string, summary: string, fieldPath?: string): void {
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
      const formEvents: Array<[FormLifeCycle, string]> = [
        [FormLifeCycle.ON_FORM_INIT, '表单初始化'],
        [FormLifeCycle.ON_FORM_MOUNT, '表单挂载'],
        [FormLifeCycle.ON_FORM_UNMOUNT, '表单卸载'],
        [FormLifeCycle.ON_FORM_VALUES_CHANGE, '值变化'],
        [FormLifeCycle.ON_FORM_SUBMIT_START, '提交开始'],
        [FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, '提交成功'],
        [FormLifeCycle.ON_FORM_SUBMIT_FAILED, '提交失败'],
        [FormLifeCycle.ON_FORM_SUBMIT_END, '提交结束'],
        [FormLifeCycle.ON_FORM_RESET, '表单重置'],
        [FormLifeCycle.ON_FORM_VALIDATE_START, '验证开始'],
        [FormLifeCycle.ON_FORM_VALIDATE_SUCCESS, '验证通过'],
        [FormLifeCycle.ON_FORM_VALIDATE_FAILED, '验证失败'],
      ]

      for (const [event, label] of formEvents) {
        disposers.push(form.on(event, () => {
          addEvent(event, label)
        }))
      }

      /** 监听字段事件（payload 为 FieldInstance） */
      const fieldEvents: Array<[FormLifeCycle, (field: FieldInstance) => string]> = [
        [FormLifeCycle.ON_FIELD_INIT, (f) => `字段创建: ${f.path}`],
        [FormLifeCycle.ON_FIELD_MOUNT, (f) => `字段挂载: ${f.path}`],
        [FormLifeCycle.ON_FIELD_UNMOUNT, (f) => `字段卸载: ${f.path}`],
        [FormLifeCycle.ON_FIELD_VALUE_CHANGE, (f) => `值变化: ${f.path} = ${JSON.stringify(f.value)?.slice(0, 50)}`],
        [FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE, (f) => `用户输入: ${f.path}`],
      ]

      for (const [event, summarize] of fieldEvents) {
        disposers.push(form.on(event, (e: FormEvent) => {
          const field = e.payload as FieldInstance
          if (field?.path) {
            addEvent(event, summarize(field), field.path)
          }
        }))
      }

      /* ======================== 字段树构建 ======================== */

      /** 从 field path 判断字段类型 */
      function getFieldType(path: string): FieldTreeNode['type'] {
        if (form.getArrayField(path)) return 'arrayField'
        if (form.getObjectField(path)) return 'objectField'
        if (form.getAllVoidFields().has(path)) return 'voidField'
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
          const type = getFieldType(path)
          nodeMap.set(path, serializeField(field as FieldInstance, type))
        }

        /* 收集所有虚拟字段 */
        const allVoidFields = form.getAllVoidFields()
        for (const [path, field] of allVoidFields) {
          if (!nodeMap.has(path)) {
            nodeMap.set(path, serializeField(field as unknown as VoidFieldInstance, 'voidField'))
          }
        }

        /* 按路径深度排序，构建树 */
        const sortedPaths = Array.from(nodeMap.keys()).sort()
        for (const path of sortedPaths) {
          const node = nodeMap.get(path)!
          const parentPath = getParentPath(path)

          if (parentPath && nodeMap.has(parentPath)) {
            nodeMap.get(parentPath)!.children.push(node)
          } else {
            roots.push(node)
          }
        }

        return roots
      }

      /* ======================== 字段详情 ======================== */

      function getFieldDetailImpl(path: string): FieldDetail | null {
        const field = form.getField(path) as FieldInstance | undefined
        const voidField = form.getAllVoidFields().get(path)

        if (!field && !voidField) return null

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
        getFieldTree: buildFieldTree,
        getFieldDetail: getFieldDetailImpl,
        getFormOverview(): FormOverview {
          const allFields = form.getAllFields()
          let errorCount = 0
          for (const [, field] of allFields) {
            if ((field as FieldInstance).errors?.length > 0) errorCount++
          }
          return {
            pattern: form.pattern,
            fieldCount: allFields.size,
            errorFieldCount: errorCount,
            values: safeSerialize(form.values) as Record<string, unknown>,
            initialValues: safeSerialize(form.initialValues) as Record<string, unknown>,
            submitting: form.submitting,
            validating: form.validating,
          }
        },
        getEventLog: () => [...eventLog],
        getValueDiff(): ValueDiffEntry[] {
          const diff: ValueDiffEntry[] = []
          const allFields = form.getAllFields()
          for (const [path, field] of allFields) {
            const f = field as FieldInstance
            const current = safeSerialize(f.value)
            const initial = safeSerialize(f.initialValue)
            const changed = JSON.stringify(current) !== JSON.stringify(initial)
            diff.push({ path, label: f.label || f.name, currentValue: current, initialValue: initial, changed })
          }
          return diff
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
          const field = form.getField(path) as FieldInstance | undefined
          const el = field?.domRef
          if (!el) return
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.style.outline = '2px solid #3b82f6'
          el.style.outlineOffset = '2px'
          el.style.transition = 'outline-color 0.3s'
          setTimeout(() => {
            el.style.outline = '2px solid #ef4444'
            setTimeout(() => {
              el.style.outline = '2px solid #3b82f6'
              setTimeout(() => {
                el.style.outline = ''
                el.style.outlineOffset = ''
              }, 300)
            }, 300)
          }, 300)
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
          if (!field) return
          if (state.visible !== undefined) field.display = state.visible ? 'visible' : 'none'
          if (state.disabled !== undefined) field.disabled = state.disabled
          if (state.preview !== undefined) field.preview = state.preview
          if (state.pattern !== undefined) field.selfPattern = state.pattern as FieldInstance['selfPattern']
          addEvent('devtools:setState', `修改状态: ${path} → ${JSON.stringify(state)}`, path)
          notify()
        },
        async validateAll(): Promise<Array<{ path: string, message: string }>> {
          const result = await form.validate()
          const errors = result.errors.map(e => ({ path: e.path, message: e.message }))
          addEvent('devtools:validate', `手动验证: ${errors.length} 个错误`)
          notify()
          return errors
        },
        resetForm(): void {
          form.reset()
          addEvent('devtools:reset', '手动重置表单')
          notify()
        },
        async submitForm(): Promise<{ success: boolean, errors: Array<{ path: string, message: string }> }> {
          const result = await form.submit()
          const errors = result.errors.map(e => ({ path: e.path, message: e.message }))
          addEvent('devtools:submit', `手动提交: ${errors.length > 0 ? `${errors.length} 个错误` : '成功'}`)
          notify()
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

      return api
    },
  }
}

/* ======================== 工具函数 ======================== */

/** 获取父路径（a.b.c → a.b） */
function getParentPath(path: string): string {
  const lastDot = path.lastIndexOf('.')
  return lastDot > 0 ? path.slice(0, lastDot) : ''
}

/** 安全序列化（避免循环引用和函数） */
function safeSerialize(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value, (_key, val) => {
      if (typeof val === 'function') return '(function)'
      if (val instanceof RegExp) return val.toString()
      if (val instanceof Date) return val.toISOString()
      return val
    }))
  } catch {
    return String(value)
  }
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
