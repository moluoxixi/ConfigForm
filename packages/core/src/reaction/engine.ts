import type { Disposer } from '@moluoxixi/shared'
import type {
  DataSourceConfig,
  FieldInstance,
  FormInstance,
  ReactionContext,
  ReactionEffect,
  ReactionRule,
} from '../types'
import { getReactiveAdapter } from '@moluoxixi/reactive'
import { debounce, DependencyGraph, FormPath, isArray, isFunction } from '@moluoxixi/shared'

/**
 * 联动引擎
 *
 * 核心职责：
 * 1. 解析字段的 reactions 配置
 * 2. 建立依赖关系图并检测循环
 * 3. 使用响应式适配器的 reaction API 自动触发联动
 */
export class ReactionEngine {
  private form: FormInstance
  /** 按字段路径索引的 disposer 映射，移除字段时可精确清理 */
  private fieldDisposers = new Map<string, Disposer[]>()
  private depGraph = new DependencyGraph()

  constructor(form: FormInstance) {
    this.form = form
  }

  /**
   * 注册字段的联动规则
   */
  registerFieldReactions(field: FieldInstance, rules: ReactionRule[]): void {
    for (const rule of rules) {
      this.registerReaction(field, rule)
    }
  }

  /**
   * 注册单条联动规则
   */
  private registerReaction(field: FieldInstance, rule: ReactionRule): void {
    const adapter = getReactiveAdapter()
    const watchPaths = isArray(rule.watch) ? rule.watch : [rule.watch]

    /* 建立依赖图 */
    for (const watchPath of watchPaths) {
      this.depGraph.addEdge(field.path, watchPath)
    }

    /* 检测循环依赖 */
    const cycle = this.depGraph.detectCycle()
    if (cycle) {
      console.warn(
        `[ConfigForm] 检测到循环联动依赖: ${cycle.join(' → ')}，`
        + `跳过字段 "${field.path}" 对 "${watchPaths.join(', ')}" 的联动`,
      )
      for (const watchPath of watchPaths) {
        this.depGraph.removeEdge(field.path, watchPath)
      }
      return
    }

    /** 收集监听的字段值 */
    const getWatchedValues = (): unknown[] => {
      return watchPaths.map((p) => {
        /* 支持通配符匹配 */
        if (p.includes('*')) {
          const matchedFields = this.form.queryFields(p)
          return matchedFields.map(f => f.value)
        }
        /**
         * 直接通过 FormPath.getIn 访问 form.values，绕过 form.getFieldValue()。
         * 原因：MobX 的 makeObservable 会将 getFieldValue 标记为 action.bound，
         * action 内部的 observable 访问不会被 MobX reaction 追踪，导致联动不触发。
         */
        return FormPath.getIn(this.form.values, p)
      })
    }

    /** 构建联动上下文 */
    const buildContext = (): ReactionContext => ({
      self: field,
      form: this.form,
      values: this.form.values as Record<string, unknown>,
    })

    /** 在指定字段上执行联动效果 */
    const executeEffect = (target: FieldInstance, effect: ReactionEffect, context: ReactionContext): void => {
      if (effect.state) {
        const state = effect.state
        if (state.display !== undefined) (target as any).display = state.display
        if (state.visible !== undefined) target.visible = state.visible
        if (state.disabled !== undefined) target.disabled = state.disabled
        if (state.readOnly !== undefined) target.readOnly = state.readOnly
        if (state.loading !== undefined) target.loading = state.loading
        if (state.required !== undefined) target.required = state.required
        if (state.pattern !== undefined) target.pattern = state.pattern
      }
      if (effect.value !== undefined) {
        const newValue = isFunction(effect.value) ? effect.value(target, context) : effect.value
        target.setValue(newValue)
      }
      if (effect.componentProps) target.setComponentProps(effect.componentProps)
      if (effect.component) target.component = effect.component
      if (effect.dataSource) {
        if (isArray(effect.dataSource)) target.setDataSource(effect.dataSource)
        else target.loadDataSource(effect.dataSource as DataSourceConfig).catch(() => {})
      }
      if (effect.run) effect.run(target, context)
    }

    /**
     * 解析联动目标字段。
     * 有 target 时作用于目标字段，否则作用于自身。
     */
    const resolveTargetField = (): FieldInstance | null => {
      if (!rule.target) return field
      const targetField = this.form.getField(rule.target)
      if (!targetField) {
        console.warn(`[ConfigForm] reactions target "${rule.target}" 未找到`)
        return null
      }
      return targetField
    }

    /**
     * 解析联动目标字段。
     * 有 target 时作用于目标字段，否则作用于自身。
     */
    const resolveTarget = (): FieldInstance | null => {
      if (!rule.target) return field
      const t = this.form.getField(rule.target)
      if (!t) {
        console.warn(`[ConfigForm] reactions target "${rule.target}" 未找到`)
        return null
      }
      return t
    }

    /** 联动执行函数 */
    const execute = (): void => {
      const context = buildContext()
      const target = resolveTarget()
      if (!target) return

      if (rule.when) {
        const conditionMet = rule.when(field, context)
        if (conditionMet && rule.fulfill) {
          executeEffect(target, rule.fulfill, context)
        }
        else if (!conditionMet && rule.otherwise) {
          executeEffect(target, rule.otherwise, context)
        }
      }
      else if (rule.fulfill) {
        executeEffect(target, rule.fulfill, context)
      }
    }

    /* 是否需要防抖 */
    const finalExecute = rule.debounce && rule.debounce > 0
      ? debounce(execute, rule.debounce)
      : execute

    /* 使用响应式 reaction 监听变化 */
    const disposer = adapter.reaction(
      () => getWatchedValues(),
      () => finalExecute(),
      { fireImmediately: true },
    )

    /* 按字段路径存储 disposer，移除字段时可精确清理 */
    if (!this.fieldDisposers.has(field.path)) {
      this.fieldDisposers.set(field.path, [])
    }
    const fieldDisposerList = this.fieldDisposers.get(field.path)!
    fieldDisposerList.push(disposer)
    if ('cancel' in finalExecute) {
      fieldDisposerList.push(() => (finalExecute as { cancel: () => void }).cancel())
    }
  }

  /**
   * 移除字段的联动
   *
   * 同时清理依赖图和该字段关联的所有 reaction disposers，
   * 防止已删除字段的联动回调继续在后台运行导致内存泄漏。
   */
  removeFieldReactions(fieldPath: string): void {
    this.depGraph.removeNode(fieldPath)

    /* 清理该字段注册的所有 reaction disposers */
    const disposers = this.fieldDisposers.get(fieldPath)
    if (disposers) {
      for (const disposer of disposers) {
        disposer()
      }
      this.fieldDisposers.delete(fieldPath)
    }
  }

  /**
   * 销毁引擎
   */
  dispose(): void {
    for (const [, disposers] of this.fieldDisposers) {
      for (const disposer of disposers) {
        disposer()
      }
    }
    this.fieldDisposers.clear()
    this.depGraph.clear()
  }
}
