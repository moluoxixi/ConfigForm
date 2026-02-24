import type { Disposer, ExpressionScope, PathSegment } from '../shared'
import type {
  DataSourceConfig,
  FieldInstance,
  FormInstance,
  ReactionContext,
  ReactionEffect,
  ReactionRule,
} from '../types'
import { getReactiveAdapter } from '../reactive'
import {
  debounce,
  DependencyGraph,
  evaluateExpression,
  FormPath,
  isArray,
  isExpression,
  isFunction,
  logger,
} from '../shared'

/**
 * 从字段路径中提取最近的数组上下文
 *
 * 对于路径如 `contacts.0.name`，提取：
 * - record：`form.values.contacts[0]`（当前行对象）
 * - index：`0`（当前行索引）
 *
 * 对于嵌套数组如 `contacts.0.phones.1.number`，提取最内层：
 * - record：`form.values.contacts[0].phones[1]`
 * - index：`1`
 *
 * @param fieldSegments - 字段路径片段
 * @param values - 表单 values 对象
 * @returns 数组上下文（非数组内字段返回空对象）
 */
function extractArrayContext(
  fieldSegments: readonly PathSegment[],
  values: Record<string, unknown>,
): { record?: Record<string, unknown>, index?: number } {
  /* 从后向前找最近的数字段（数组索引），以获取最内层数组上下文 */
  for (let i = fieldSegments.length - 1; i >= 0; i--) {
    const seg = fieldSegments[i]
    if (typeof seg === 'number' || /^\d+$/.test(String(seg))) {
      const index = Number(seg)
      const record = FormPath.getInBySegments<Record<string, unknown>>(
        values,
        fieldSegments.slice(0, i + 1),
      )
      return {
        record: record !== undefined && record !== null
          ? record as Record<string, unknown>
          : undefined,
        index,
      }
    }
  }

  return {}
}

/**
 * watch 路径编译后的描述信息。
 * 无通配符路径会提前拆分 segments，减少运行时重复解析成本。
 */
interface WatchDescriptor {
  path: string
  hasWildcard: boolean
  segments?: readonly PathSegment[]
}

/**
 * 预编译 watch 路径列表。
 * @param watchPaths reaction 监听路径。
 * @returns 编译后的 watch 描述数组。
 */
function compileWatchDescriptors(watchPaths: string[]): WatchDescriptor[] {
  return watchPaths.map((path) => {
    if (path.includes('*')) {
      return { path, hasWildcard: true }
    }
    return {
      path,
      hasWildcard: false,
      segments: FormPath.getSegments(path),
    }
  })
}

/**
 * 基于字段路径创建数组上下文解析器。
 * 当路径中包含数组索引时，解析结果会携带 `$record` 与 `$index`。
 * @param fieldPath 当前字段路径。
 * @returns 数组上下文解析函数。
 */
function createArrayContextResolver(fieldPath: string): (values: Record<string, unknown>) => {
  record?: Record<string, unknown>
  index?: number
} {
  const segments = FormPath.getSegments(fieldPath)
  let hasArrayIndex = false
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]
    if (typeof seg === 'number' || /^\d+$/.test(String(seg))) {
      hasArrayIndex = true
      break
    }
  }
  if (!hasArrayIndex) {
    return () => ({})
  }
  return (values: Record<string, unknown>) => extractArrayContext(segments, values)
}

/**
 * 将 ReactionContext 转换为表达式作用域
 *
 * 映射关系：
 * - context.self → $self
 * - context.values → $values
 * - context.form → $form
 * - context.record → $record
 * - context.index → $index
 * - context.deps → $deps
 * @param context 当前联动上下文。
 * @returns 表达式引擎可读取的标准作用域对象。
 */
function contextToScope(context: ReactionContext): ExpressionScope {
  return {
    $self: context.self,
    $values: context.values,
    $form: context.form,
    $record: context.record,
    $index: context.index,
    $deps: context.deps,
  }
}

/**
 * 每轮微任务批次内最大联动执行次数。
 * 超过此阈值视为死循环，终止后续联动执行并输出错误日志。
 */
const MAX_REACTION_EXECUTIONS_PER_BATCH = 100

/**
 * 在微任务队列中延后执行。
 * 优先使用 queueMicrotask，低版本环境回退到 Promise.then。
 * @param fn 需要延后执行的函数。
 */
function deferMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn)
    return
  }
  Promise.resolve().then(fn)
}

/**
 * 联动执行追踪记录
 *
 * 记录每次联动的触发源、目标、条件结果等信息，
 * 用于调试和排查联动链路。
 */
export interface ReactionTraceRecord {
  /** 触发时间戳 */
  timestamp: number
  /** 触发源字段路径 */
  sourcePath: string
  /** 目标字段路径 */
  targetPath: string
  /** watch 的路径列表 */
  watchPaths: string[]
  /** 依赖值 */
  deps: unknown[]
  /** when 条件结果（无 when 时为 undefined） */
  conditionResult?: boolean
  /** 执行的效果分支 */
  branch: 'fulfill' | 'otherwise' | 'none'
  /** 执行耗时（ms） */
  duration: number
}

/**
 * 联动追踪器
 *
 * 开发模式下可启用，记录所有联动执行的完整链路信息。
 * 用于调试复杂联动逻辑。
 */
export class ReactionTracer {
  private records: ReactionTraceRecord[] = []
  private maxRecords: number
  /** 是否启用追踪（性能开关） */
  enabled: boolean

  /**
   * 创建联动追踪器。
   * @param maxRecords 最大记录条数。
   * @param enabled 是否默认启用追踪。
   */
  constructor(maxRecords = 200, enabled = false) {
    this.maxRecords = maxRecords
    this.enabled = enabled
  }

  /**
   * 记录一次联动执行
   * @param record 参数 `record`用于提供当前函数执行所需的输入信息。
   */
  trace(record: ReactionTraceRecord): void {
    if (!this.enabled)
      return
    this.records.push(record)
    /* 淘汰最早的记录 */
    while (this.records.length > this.maxRecords) {
      this.records.shift()
    }
  }

  /**
   * 获取所有追踪记录
   * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
   */
  getRecords(): readonly ReactionTraceRecord[] {
    return this.records
  }

  /**
   * 获取指定字段的触发记录
   * @param sourcePath 触发源字段路径。
   * @returns 与该 sourcePath 匹配的追踪记录列表。
   */
  getRecordsBySource(sourcePath: string): ReactionTraceRecord[] {
    return this.records.filter(r => r.sourcePath === sourcePath)
  }

  /**
   * 获取指定字段被影响的记录
   * @param targetPath 目标字段路径。
   * @returns 与该 targetPath 匹配的追踪记录列表。
   */
  getRecordsByTarget(targetPath: string): ReactionTraceRecord[] {
    return this.records.filter(r => r.targetPath === targetPath)
  }

  /**
   * 获取完整联动链路（A → B → C → ...）
   * @param startPath 起始字段路径。
   * @returns 从起点出发推导出的所有链路。
   */
  getChain(startPath: string): string[][] {
    const chains: string[][] = []
    const visited = new Set<string>()

    /**
     * 深度优先遍历联动图，收集从起点可达的路径链。
     * @param path 当前节点路径。
     * @param chain 当前链路快照。
     */
    const dfs = (path: string, chain: string[]): void => {
      if (visited.has(path))
        return
      visited.add(path)

      const affected = this.records
        .filter(r => r.sourcePath === path || r.watchPaths.includes(path))
        .map(r => r.targetPath)
        .filter(t => !visited.has(t))

      if (affected.length === 0) {
        if (chain.length > 1)
          chains.push([...chain])
        return
      }

      for (const target of affected) {
        chain.push(target)
        dfs(target, chain)
        chain.pop()
      }
    }

    dfs(startPath, [startPath])
    return chains
  }

  /**
   * 清空记录
   */
  clear(): void {
    this.records = []
  }
}

/**
 * 联动引擎
 *
 * 核心职责：
 * 1. 解析字段的 reactions 配置
 * 2. 建立依赖关系图并检测循环
 * 3. 使用响应式适配器的 reaction API 自动触发联动
 * 4. 编译并执行表达式字符串（{{expression}} 语法）
 * 5. 自动注入数组上下文（$record、$index）
 * 6. 运行时死循环防护（计数器 + 微任务重置）
 */
export class ReactionEngine {
  private form: FormInstance
  /** 按字段路径索引的 disposer 映射，移除字段时可精确清理 */
  private fieldDisposers = new Map<string, Disposer[]>()
  private depGraph = new DependencyGraph()
  /** 当前批次内联动执行计数（运行时死循环检测） */
  private _executionCount = 0
  /** 是否已调度本轮微任务的计数器重置 */
  private _resetScheduled = false
  /** 联动追踪器（调试用） */
  readonly tracer = new ReactionTracer()

  /**
   * 创建联动引擎实例。
   * @param form 当前表单实例。
   */
  constructor(form: FormInstance) {
    this.form = form
  }

  /**
   * 启用/禁用联动链路追踪
   * @param enabled 是否启用追踪。
   */
  enableTracing(enabled: boolean): void {
    this.tracer.enabled = enabled
  }

  /**
   * 注册字段的联动规则
   * @param field 参数 `field`用于提供当前函数执行所需的输入信息。
   * @param rules 参数 `rules`用于提供当前函数执行所需的输入信息。
   */
  registerFieldReactions(field: FieldInstance, rules: ReactionRule[]): void {
    for (const rule of rules) {
      this.registerReaction(field, rule)
    }
  }

  /**
   * 注册单条联动规则
   * @param field 触发联动的源字段。
   * @param rule 联动规则定义。
   */
  private registerReaction(field: FieldInstance, rule: ReactionRule): void {
    const adapter = getReactiveAdapter(this.form)
    const watchPaths = isArray(rule.watch) ? rule.watch : [rule.watch]
    const watchDescriptors = compileWatchDescriptors(watchPaths)
    const resolveArrayContext = createArrayContextResolver(field.path)

    /* 建立依赖图 */
    for (const watchPath of watchPaths) {
      this.depGraph.addEdge(field.path, watchPath)
    }

    /* 检测循环依赖 */
    const cycle = this.depGraph.detectCycle()
    if (cycle) {
      logger.warn(
        `[ConfigForm] 检测到循环联动依赖: ${cycle.join(' → ')}，`
        + `跳过字段 "${field.path}" 对 "${watchPaths.join(', ')}" 的联动`,
      )
      for (const watchPath of watchPaths) {
        this.depGraph.removeEdge(field.path, watchPath)
      }
      return
    }

    /**
     * 收集监听的字段值
     * @returns watch 描述对应的依赖值数组。
     */
    const getWatchedValues = (): unknown[] => {
      const formValues = this.form.values as Record<string, unknown>
      const deps = Array.from({ length: watchDescriptors.length })
      for (let i = 0; i < watchDescriptors.length; i++) {
        const descriptor = watchDescriptors[i]
        if (descriptor.hasWildcard) {
          const matchedFields = this.form.queryFields(descriptor.path)
          deps[i] = matchedFields.map(f => f.value)
          continue
        }
        /**
         * 直接通过 FormPath.getInBySegments 访问 form.values，绕过 form.getFieldValue()。
         * 原因：MobX 的 makeObservable 会将 getFieldValue 标记为 action.bound，
         * action 内部的 observable 访问不会被 MobX reaction 追踪，导致联动不触发。
         */
        deps[i] = FormPath.getInBySegments(
          formValues,
          descriptor.segments as readonly PathSegment[],
        )
      }
      return deps
    }

    /**
     * 构建联动上下文（含数组上下文和依赖值）
     *
     * @param deps - getWatchedValues() 返回的依赖值数组
     * @returns 当前联动执行上下文。
     */
    const buildContext = (deps: unknown[]): ReactionContext => {
      const formValues = this.form.values as Record<string, unknown>
      const { record, index } = resolveArrayContext(formValues)
      return {
        self: field,
        form: this.form,
        values: formValues,
        record,
        index,
        deps,
      }
    }

    /**
     * 在指定字段上执行联动效果
     * @param target 需要被更新的目标字段。
     * @param effect 联动效果配置。
     * @param context 当前联动上下文。
     */
    const executeEffect = (
      target: FieldInstance,
      effect: ReactionEffect,
      context: ReactionContext,
    ): void => {
      /* 状态更新 */
      if (effect.state) {
        const state = effect.state
        if (state.display !== undefined)
          (target as any).display = state.display
        if (state.visible !== undefined)
          target.visible = state.visible
        if (state.disabled !== undefined)
          target.disabled = state.disabled
        if (state.preview !== undefined)
          target.preview = state.preview
        if (state.loading !== undefined)
          target.loading = state.loading
        if (state.required !== undefined)
          target.required = state.required
        if (state.pattern !== undefined)
          target.pattern = state.pattern
      }

      /* 值设置：支持函数、表达式、静态值 */
      if (effect.value !== undefined) {
        let newValue: unknown
        if (isFunction(effect.value)) {
          newValue = effect.value(target, context)
        }
        else if (isExpression(effect.value)) {
          newValue = evaluateExpression(effect.value, contextToScope(context))
        }
        else {
          newValue = effect.value
        }
        target.setValue(newValue)
      }

      /* 组件 Props 更新 */
      if (effect.componentProps)
        target.setComponentProps(effect.componentProps)

      /* 组件切换 */
      if (effect.component)
        target.component = effect.component

      /* 数据源更新 */
      if (effect.dataSource) {
        if (isArray(effect.dataSource))
          target.setDataSource(effect.dataSource)
        else target.loadDataSource(effect.dataSource as DataSourceConfig).catch(() => {})
      }

      /* 自定义执行：支持同步函数、异步函数和表达式 */
      if (effect.run) {
        if (isFunction(effect.run)) {
          const result = effect.run(target, context)
          /* 支持异步联动：async run 函数返回 Promise */
          if (result !== undefined && typeof (result as Promise<void>).then === 'function') {
            target.loading = true;
            (result as Promise<void>)
              .catch((err: unknown) => {
                if (err instanceof DOMException && (err as DOMException).name === 'AbortError')
                  return
                logger.error(`异步联动执行失败 (${target.path})`, err)
              })
              .finally(() => {
                target.loading = false
              })
          }
        }
        else if (isExpression(effect.run)) {
          evaluateExpression(effect.run, contextToScope(context))
        }
      }
    }

    /**
     * 解析联动目标字段。
     * 有 target 时作用于目标字段，否则作用于自身。
     * @returns 可执行联动的目标字段；找不到目标时返回 null。
     */
    const resolveTarget = (): FieldInstance | null => {
      if (!rule.target)
        return field
      const t = this.form.getField(rule.target)
      if (!t) {
        logger.warn(`reactions target "${rule.target}" 未找到`)
        return null
      }
      return t
    }

    /**
     * 联动执行函数（支持同步和异步效果）
     */
    const execute = (): void => {
      /**
       * 运行时死循环防护。
       *
       * 每次联动执行时递增计数器。在第一次执行时调度一个微任务重置计数器，
       * 这样同一轮微任务批次（即同步联动链 A→B→C→...）内的所有执行共享一个计数窗口。
       * 如果执行次数超过阈值，判定为死循环并终止。
       */
      this._executionCount++
      if (!this._resetScheduled) {
        this._resetScheduled = true
        Promise.resolve().then(() => {
          this._executionCount = 0
          this._resetScheduled = false
        })
      }
      if (this._executionCount > MAX_REACTION_EXECUTIONS_PER_BATCH) {
        logger.error(
          `[ConfigForm] 联动执行次数超过 ${MAX_REACTION_EXECUTIONS_PER_BATCH} 次/批次，`
          + `疑似死循环，已终止。涉及字段: "${field.path}"`,
        )
        return
      }

      const traceStart = this.tracer.enabled ? performance.now() : 0

      /* 获取当前 watch 依赖值，注入到上下文中 */
      const deps = getWatchedValues()
      const context = buildContext(deps)
      const target = resolveTarget()
      if (!target)
        return

      let conditionResult: boolean | undefined
      let executedBranch: 'fulfill' | 'otherwise' | 'none' = 'none'

      if (rule.when) {
        /* 条件判断：支持函数和表达式 */
        let conditionMet: boolean
        if (isFunction(rule.when)) {
          conditionMet = rule.when(field, context)
        }
        else {
          conditionMet = !!evaluateExpression<boolean>(
            rule.when,
            contextToScope(context),
          )
        }
        conditionResult = conditionMet

        if (conditionMet && rule.fulfill) {
          executeEffect(target, rule.fulfill, context)
          executedBranch = 'fulfill'
        }
        else if (!conditionMet && rule.otherwise) {
          executeEffect(target, rule.otherwise, context)
          executedBranch = 'otherwise'
        }
      }
      else if (rule.fulfill) {
        executeEffect(target, rule.fulfill, context)
        executedBranch = 'fulfill'
      }

      /* 记录追踪信息 */
      if (this.tracer.enabled) {
        this.tracer.trace({
          timestamp: Date.now(),
          sourcePath: field.path,
          targetPath: target.path,
          watchPaths,
          deps,
          conditionResult,
          branch: executedBranch,
          duration: performance.now() - traceStart,
        })
      }
    }

    /* 是否需要防抖 */
    const finalExecute = rule.debounce && rule.debounce > 0
      ? debounce(execute, rule.debounce)
      : execute

    /**
     * 运行状态标记。
     * 防止字段已卸载后，微任务中的首轮联动继续执行。
     */
    let disposed = false

    /**
     * 统一执行入口，先检查释放状态再触发最终执行函数。
     */
    const runFinalExecute = (): void => {
      if (disposed)
        return
      finalExecute()
    }

    /* 使用响应式 reaction 监听变化（首轮执行延后到微任务，避免渲染期状态写入） */
    const disposer = adapter.reaction(
      () => getWatchedValues(),
      () => runFinalExecute(),
      { fireImmediately: false },
    )
    deferMicrotask(() => {
      runFinalExecute()
    })

    /* 按字段路径存储 disposer，移除字段时可精确清理 */
    if (!this.fieldDisposers.has(field.path)) {
      this.fieldDisposers.set(field.path, [])
    }
    const fieldDisposerList = this.fieldDisposers.get(field.path)!
    fieldDisposerList.push(() => {
      disposed = true
      disposer()
    })
    if ('cancel' in finalExecute) {
      fieldDisposerList.push(() => (finalExecute as { cancel: () => void }).cancel())
    }
  }

  /**
   * 移除字段的联动
   *
   * 同时清理依赖图和该字段关联的所有 reaction disposers，
   * 防止已删除字段的联动回调继续在后台运行导致内存泄漏。
   * @param fieldPath 参数 `fieldPath`用于提供当前函数执行所需的输入信息。
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
