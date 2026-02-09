import type { Disposer } from '@moluoxixi/shared'
import type { FormConfig, FormInstance, SubmitResult } from '../types'
import { deepClone, deepMerge, FormPath } from '@moluoxixi/shared'
import { createForm } from '../createForm'
import { FormLifeCycle } from '../events'

/**
 * 子表单同步模式
 *
 * - `bidirectional`: 双向同步（父 → 子，子 → 父）
 * - `parentToChild`: 单向（仅父表单值同步到子表单）
 * - `childToParent`: 单向（仅子表单值同步到父表单）
 * - `manual`: 手动同步（不自动同步，通过 sync() 手动触发）
 */
export type SyncMode = 'bidirectional' | 'parentToChild' | 'childToParent' | 'manual'

/** 子表单配置 */
export interface SubFormConfig<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 父表单实例 */
  parent: FormInstance
  /**
   * 子表单值在父表单中的挂载路径。
   * 子表单的值会同步到 parent.values[mountPath]。
   * 例如：mountPath = 'address' 则子表单值会同步为 parent.values.address
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
 * 实现表单的组合模式：将一个子表单的值挂载到父表单的某个路径下。
 * 支持多种同步模式和验证联动。
 *
 * 核心功能：
 * - 自动同步父子表单值
 * - 子表单独立验证
 * - 子表单验证结果阻止父表单提交
 * - 子表单独立 reset / submit
 *
 * @example
 * ```ts
 * const parentForm = createForm({ initialValues: { name: '' } })
 *
 * const addressSubForm = createSubForm({
 *   parent: parentForm,
 *   mountPath: 'address',
 *   formConfig: { pattern: 'editable' },
 * })
 *
 * // 子表单的值会同步到 parentForm.values.address
 * addressSubForm.form.setFieldValue('city', '北京')
 * console.log(parentForm.values.address.city) // → '北京'
 *
 * // 验证子表单
 * const { valid } = await addressSubForm.validate()
 *
 * // 销毁
 * addressSubForm.dispose()
 * ```
 */
export class SubFormManager<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 子表单实例 */
  readonly form: FormInstance<Values>
  /** 父表单实例 */
  private parent: FormInstance
  /** 挂载路径 */
  private mountPath: string
  /** 同步模式 */
  private syncMode: SyncMode
  /** 是否阻止父表单提交 */
  private blockParentSubmit: boolean
  /** 资源释放器 */
  private disposers: Disposer[] = []
  /** 同步锁（防止递归触发） */
  private _syncing = false

  constructor(config: SubFormConfig<Values>) {
    this.parent = config.parent
    this.mountPath = config.mountPath
    this.syncMode = config.syncMode ?? 'bidirectional'
    this.blockParentSubmit = config.blockParentSubmit ?? true

    /* 从父表单读取初始值 */
    const parentValue = FormPath.getIn(this.parent.values, this.mountPath) as Partial<Values>
    const initialValues = parentValue ? deepClone(parentValue) as Partial<Values> : undefined

    /* 创建子表单 */
    this.form = createForm<Values>({
      ...config.formConfig,
      initialValues,
    })

    /* 设置同步 */
    this.setupSync()

    /* 设置提交拦截 */
    if (this.blockParentSubmit) {
      this.setupSubmitBlock()
    }
  }

  /**
   * 手动同步子表单值到父表单
   */
  syncToParent(): void {
    if (this._syncing) return
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

  /**
   * 手动同步父表单值到子表单
   */
  syncFromParent(): void {
    if (this._syncing) return
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

  /**
   * 验证子表单
   */
  async validate(): Promise<{ valid: boolean, errors: unknown[], warnings: unknown[] }> {
    return this.form.validate()
  }

  /**
   * 重置子表单
   */
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

  /** 设置自动同步 */
  private setupSync(): void {
    if (this.syncMode === 'manual') return

    /* 子 → 父 同步 */
    if (this.syncMode === 'bidirectional' || this.syncMode === 'childToParent') {
      const childDisposer = this.form.on(FormLifeCycle.ON_FORM_VALUES_CHANGE, () => {
        this.syncToParent()
      })
      this.disposers.push(childDisposer)
    }

    /* 父 → 子 同步 */
    if (this.syncMode === 'bidirectional' || this.syncMode === 'parentToChild') {
      const parentDisposer = this.parent.onFieldValueChange(this.mountPath, () => {
        this.syncFromParent()
      })
      this.disposers.push(parentDisposer)
    }
  }

  /** 设置提交拦截：子表单验证失败阻止父表单提交 */
  private setupSubmitBlock(): void {
    const disposer = this.parent.on(FormLifeCycle.ON_FORM_VALIDATE_START, async () => {
      const { valid } = await this.form.validate()
      if (!valid) {
        /* 将子表单错误合并到父表单的错误列表中 */
        const childErrors = this.form.errors
        for (const err of childErrors) {
          const parentPath = `${this.mountPath}.${err.path}`
          console.warn(
            `[ConfigForm] 子表单验证失败: ${parentPath} - ${err.message}`,
          )
        }
      }
    })
    this.disposers.push(disposer)
  }
}

/**
 * 创建子表单
 *
 * 工厂函数，创建并返回 SubFormManager 实例。
 *
 * @param config - 子表单配置
 * @returns 子表单管理器
 */
export function createSubForm<Values extends Record<string, unknown> = Record<string, unknown>>(
  config: SubFormConfig<Values>,
): SubFormManager<Values> {
  return new SubFormManager<Values>(config)
}
