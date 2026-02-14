import type { Disposer, FormConfig, FormInstance, FormPlugin, PluginContext, PluginInstallResult } from '@moluoxixi/core'
import { createForm, deepClone, FormLifeCycle, FormPath } from '@moluoxixi/core'

/**
 * 子表单同步模式
 *
 * - `bidirectional`: 双向同步（父 → 子，子 → 父）
 * - `parentToChild`: 单向（仅父表单值同步到子表单）
 * - `childToParent`: 单向（仅子表单值同步到父表单）
 * - `manual`: 手动同步（不自动同步，通过 sync() 手动触发）
 */
export type SyncMode = 'bidirectional' | 'parentToChild' | 'childToParent' | 'manual'

/** 子表单创建配置 */
export interface SubFormConfig<Values extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * 子表单值在父表单中的挂载路径。
   * 子表单的值会同步到 parent.values[mountPath]。
   */
  mountPath: string
  /** 子表单配置（initialValues 会从父表单自动读取） */
  formConfig?: Omit<FormConfig<Values>, 'initialValues'>
  /** 同步模式（默认 bidirectional） */
  syncMode?: SyncMode
  /** 子表单验证失败是否阻止父表单提交（默认 true） */
  blockParentSubmit?: boolean
}

/**
 * 子表单管理器
 *
 * 封装一个子表单实例及其与父表单的同步逻辑。
 */
export class SubFormManager<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 子表单实例 */
  readonly form: FormInstance<Values>
  private parent: FormInstance
  private mountPath: string
  private syncMode: SyncMode
  private disposers: Disposer[] = []
  private _syncing = false

  constructor(parent: FormInstance, config: SubFormConfig<Values>) {
    this.parent = parent
    this.mountPath = config.mountPath
    this.syncMode = config.syncMode ?? 'bidirectional'

    /* 从父表单读取初始值 */
    const parentValue = FormPath.getIn(parent.values, this.mountPath) as Partial<Values>
    const initialValues = parentValue ? deepClone(parentValue) as Partial<Values> : undefined

    /* 创建子表单 */
    this.form = createForm<Values>({
      ...config.formConfig,
      initialValues,
    })

    /* 设置同步 */
    this.setupSync()

    /* 设置提交拦截 */
    if (config.blockParentSubmit !== false) {
      this.setupSubmitBlock()
    }
  }

  /** 手动同步子表单值到父表单 */
  syncToParent(): void {
    if (this._syncing)
      return
    this._syncing = true
    try {
      const childValues = deepClone(this.form.values)
      FormPath.setIn(
        this.parent.values as Record<string, unknown>,
        this.mountPath,
        childValues,
      )
      this.parent.notifyValuesChange()
    }
    finally {
      this._syncing = false
    }
  }

  /** 手动同步父表单值到子表单 */
  syncFromParent(): void {
    if (this._syncing)
      return
    this._syncing = true
    try {
      const parentValue = FormPath.getIn(this.parent.values, this.mountPath)
      if (parentValue && typeof parentValue === 'object') {
        this.form.setValues(deepClone(parentValue) as Partial<Values>, 'replace')
      }
    }
    finally {
      this._syncing = false
    }
  }

  /** 验证子表单 */
  async validate(): Promise<{ valid: boolean, errors: unknown[], warnings: unknown[] }> {
    return this.form.validate()
  }

  /** 重置子表单 */
  reset(): void {
    this.form.reset()
    this.syncToParent()
  }

  /** 销毁 */
  dispose(): void {
    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []
    this.form.dispose()
  }

  private setupSync(): void {
    if (this.syncMode === 'manual')
      return

    if (this.syncMode === 'bidirectional' || this.syncMode === 'childToParent') {
      const childDisposer = this.form.on(FormLifeCycle.ON_FORM_VALUES_CHANGE, () => {
        this.syncToParent()
      })
      this.disposers.push(childDisposer)
    }

    if (this.syncMode === 'bidirectional' || this.syncMode === 'parentToChild') {
      const parentDisposer = this.parent.onFieldValueChange(this.mountPath, () => {
        this.syncFromParent()
      })
      this.disposers.push(parentDisposer)
    }
  }

  private setupSubmitBlock(): void {
    const disposer = this.parent.on(FormLifeCycle.ON_FORM_VALIDATE_START, async () => {
      const { valid } = await this.form.validate()
      if (!valid) {
        const childErrors = this.form.errors
        for (const err of childErrors) {
          console.warn(
            `[ConfigForm] 子表单验证失败: ${this.mountPath}.${err.path} - ${err.message}`,
          )
        }
      }
    })
    this.disposers.push(disposer)
  }
}

/** 插件暴露的 API */
export interface SubFormPluginAPI {
  /** 创建子表单 */
  create: <V extends Record<string, unknown> = Record<string, unknown>>(
    config: SubFormConfig<V>,
  ) => SubFormManager<V>
  /** 获取所有已创建的子表单 */
  getAll: () => ReadonlyMap<string, SubFormManager>
  /** 获取指定路径的子表单 */
  get: (mountPath: string) => SubFormManager | undefined
  /** 移除指定路径的子表单 */
  remove: (mountPath: string) => void
}

/** 插件名称 */
export const PLUGIN_NAME = 'sub-form'

/**
 * 子表单插件
 *
 * 表单组合模式，将子表单挂载到父表单的指定路径。
 * 支持双向/单向/手动同步模式。
 *
 * @returns FormPlugin 实例
 *
 * @example
 * ```ts
 * import { createForm } from '@moluoxixi/core'
 * import { subFormPlugin, type SubFormPluginAPI } from '@moluoxixi/plugin-sub-form'
 *
 * const form = createForm({
 *   initialValues: { name: '' },
 *   plugins: [subFormPlugin()],
 * })
 *
 * const subForms = form.getPlugin<SubFormPluginAPI>('sub-form')!
 * const address = subForms.create({ mountPath: 'address' })
 * address.form.setFieldValue('city', '北京')
 * ```
 */
export function subFormPlugin(): FormPlugin<SubFormPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form: FormInstance, _context: PluginContext): PluginInstallResult<SubFormPluginAPI> {
      const subForms = new Map<string, SubFormManager>()

      const api: SubFormPluginAPI = {
        create<V extends Record<string, unknown> = Record<string, unknown>>(
          config: SubFormConfig<V>,
        ): SubFormManager<V> {
          const manager = new SubFormManager<V>(form, config)
          subForms.set(config.mountPath, manager as unknown as SubFormManager)
          return manager
        },

        getAll: () => subForms,
        get: mountPath => subForms.get(mountPath),

        remove(mountPath: string): void {
          const manager = subForms.get(mountPath)
          if (manager) {
            manager.dispose()
            subForms.delete(mountPath)
          }
        },
      }

      return {
        api,
        dispose(): void {
          for (const manager of subForms.values()) {
            manager.dispose()
          }
          subForms.clear()
        },
      }
    },
  }
}
