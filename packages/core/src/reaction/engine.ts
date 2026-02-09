import type { Disposer, ExpressionScope } from '@moluoxixi/shared';
import type {
  DataSourceConfig,
  FieldInstance,
  FormInstance,
  ReactionContext,
  ReactionEffect,
  ReactionRule,
} from '../types';
import { getReactiveAdapter } from '@moluoxixi/reactive';
import {
  debounce,
  DependencyGraph,
  evaluateExpression,
  FormPath,
  isArray,
  isExpression,
  isFunction,
} from '@moluoxixi/shared';

/** 快速判断路径是否包含数组索引（数字段） */
const ARRAY_INDEX_RE = /(?:^|\.)(\d+)(?:\.|$)|\[(\d+)\]/;

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
 * @param fieldPath - 字段完整路径
 * @param values - 表单 values 对象
 * @returns 数组上下文（非数组内字段返回空对象）
 */
function extractArrayContext(
  fieldPath: string,
  values: Record<string, unknown>,
): { record?: Record<string, unknown>, index?: number } {
  /* 快速排除：路径中不包含数字段则跳过解析 */
  if (!ARRAY_INDEX_RE.test(fieldPath)) return {};

  const segments = FormPath.parse(fieldPath);

  /* 从后向前找最近的数字段（数组索引），以获取最内层数组上下文 */
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (typeof seg === 'number' || /^\d+$/.test(String(seg))) {
      const index = Number(seg);
      /* 记录路径 = 数组路径 + 索引，如 contacts.0 → contacts[0] */
      const recordPath = FormPath.stringify(segments.slice(0, i + 1));
      const record = FormPath.getIn<Record<string, unknown>>(values, recordPath);
      return {
        record: record !== undefined && record !== null
          ? record as Record<string, unknown>
          : undefined,
        index,
      };
    }
  }

  return {};
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
 */
function contextToScope(context: ReactionContext): ExpressionScope {
  return {
    $self: context.self,
    $values: context.values,
    $form: context.form,
    $record: context.record,
    $index: context.index,
    $deps: context.deps,
  };
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
 */
export class ReactionEngine {
  private form: FormInstance;
  /** 按字段路径索引的 disposer 映射，移除字段时可精确清理 */
  private fieldDisposers = new Map<string, Disposer[]>();
  private depGraph = new DependencyGraph();

  constructor(form: FormInstance) {
    this.form = form;
  }

  /**
   * 注册字段的联动规则
   */
  registerFieldReactions(field: FieldInstance, rules: ReactionRule[]): void {
    for (const rule of rules) {
      this.registerReaction(field, rule);
    }
  }

  /**
   * 注册单条联动规则
   */
  private registerReaction(field: FieldInstance, rule: ReactionRule): void {
    const adapter = getReactiveAdapter();
    const watchPaths = isArray(rule.watch) ? rule.watch : [rule.watch];

    /* 建立依赖图 */
    for (const watchPath of watchPaths) {
      this.depGraph.addEdge(field.path, watchPath);
    }

    /* 检测循环依赖 */
    const cycle = this.depGraph.detectCycle();
    if (cycle) {
      console.warn(
        `[ConfigForm] 检测到循环联动依赖: ${cycle.join(' → ')}，`
        + `跳过字段 "${field.path}" 对 "${watchPaths.join(', ')}" 的联动`,
      );
      for (const watchPath of watchPaths) {
        this.depGraph.removeEdge(field.path, watchPath);
      }
      return;
    }

    /** 收集监听的字段值 */
    const getWatchedValues = (): unknown[] => {
      return watchPaths.map((p) => {
        /* 支持通配符匹配 */
        if (p.includes('*')) {
          const matchedFields = this.form.queryFields(p);
          return matchedFields.map(f => f.value);
        }
        /**
         * 直接通过 FormPath.getIn 访问 form.values，绕过 form.getFieldValue()。
         * 原因：MobX 的 makeObservable 会将 getFieldValue 标记为 action.bound，
         * action 内部的 observable 访问不会被 MobX reaction 追踪，导致联动不触发。
         */
        return FormPath.getIn(this.form.values, p);
      });
    };

    /**
     * 构建联动上下文（含数组上下文和依赖值）
     *
     * @param deps - getWatchedValues() 返回的依赖值数组
     */
    const buildContext = (deps: unknown[]): ReactionContext => {
      const formValues = this.form.values as Record<string, unknown>;
      const { record, index } = extractArrayContext(field.path, formValues);
      return {
        self: field,
        form: this.form,
        values: formValues,
        record,
        index,
        deps,
      };
    };

    /** 在指定字段上执行联动效果 */
    const executeEffect = (
      target: FieldInstance,
      effect: ReactionEffect,
      context: ReactionContext,
    ): void => {
      /* 状态更新 */
      if (effect.state) {
        const state = effect.state;
        if (state.display !== undefined) (target as any).display = state.display;
        if (state.visible !== undefined) target.visible = state.visible;
        if (state.disabled !== undefined) target.disabled = state.disabled;
        if (state.readOnly !== undefined) target.readOnly = state.readOnly;
        if (state.loading !== undefined) target.loading = state.loading;
        if (state.required !== undefined) target.required = state.required;
        if (state.pattern !== undefined) target.pattern = state.pattern;
      }

      /* 值设置：支持函数、表达式、静态值 */
      if (effect.value !== undefined) {
        let newValue: unknown;
        if (isFunction(effect.value)) {
          newValue = effect.value(target, context);
        }
        else if (isExpression(effect.value)) {
          newValue = evaluateExpression(effect.value, contextToScope(context));
        }
        else {
          newValue = effect.value;
        }
        target.setValue(newValue);
      }

      /* 组件 Props 更新 */
      if (effect.componentProps) target.setComponentProps(effect.componentProps);

      /* 组件切换 */
      if (effect.component) target.component = effect.component;

      /* 数据源更新 */
      if (effect.dataSource) {
        if (isArray(effect.dataSource)) target.setDataSource(effect.dataSource);
        else target.loadDataSource(effect.dataSource as DataSourceConfig).catch(() => {});
      }

      /* 自定义执行：支持函数和表达式 */
      if (effect.run) {
        if (isFunction(effect.run)) {
          effect.run(target, context);
        }
        else if (isExpression(effect.run)) {
          evaluateExpression(effect.run, contextToScope(context));
        }
      }
    };

    /**
     * 解析联动目标字段。
     * 有 target 时作用于目标字段，否则作用于自身。
     */
    const resolveTarget = (): FieldInstance | null => {
      if (!rule.target) return field;
      const t = this.form.getField(rule.target);
      if (!t) {
        console.warn(`[ConfigForm] reactions target "${rule.target}" 未找到`);
        return null;
      }
      return t;
    };

    /** 联动执行函数 */
    const execute = (): void => {
      /* 获取当前 watch 依赖值，注入到上下文中 */
      const deps = getWatchedValues();
      const context = buildContext(deps);
      const target = resolveTarget();
      if (!target) return;

      if (rule.when) {
        /* 条件判断：支持函数和表达式 */
        let conditionMet: boolean;
        if (isFunction(rule.when)) {
          conditionMet = rule.when(field, context);
        }
        else {
          conditionMet = !!evaluateExpression<boolean>(
            rule.when,
            contextToScope(context),
          );
        }

        if (conditionMet && rule.fulfill) {
          executeEffect(target, rule.fulfill, context);
        }
        else if (!conditionMet && rule.otherwise) {
          executeEffect(target, rule.otherwise, context);
        }
      }
      else if (rule.fulfill) {
        executeEffect(target, rule.fulfill, context);
      }
    };

    /* 是否需要防抖 */
    const finalExecute = rule.debounce && rule.debounce > 0
      ? debounce(execute, rule.debounce)
      : execute;

    /* 使用响应式 reaction 监听变化 */
    const disposer = adapter.reaction(
      () => getWatchedValues(),
      () => finalExecute(),
      { fireImmediately: true },
    );

    /* 按字段路径存储 disposer，移除字段时可精确清理 */
    if (!this.fieldDisposers.has(field.path)) {
      this.fieldDisposers.set(field.path, []);
    }
    const fieldDisposerList = this.fieldDisposers.get(field.path)!;
    fieldDisposerList.push(disposer);
    if ('cancel' in finalExecute) {
      fieldDisposerList.push(() => (finalExecute as { cancel: () => void }).cancel());
    }
  }

  /**
   * 移除字段的联动
   *
   * 同时清理依赖图和该字段关联的所有 reaction disposers，
   * 防止已删除字段的联动回调继续在后台运行导致内存泄漏。
   */
  removeFieldReactions(fieldPath: string): void {
    this.depGraph.removeNode(fieldPath);

    /* 清理该字段注册的所有 reaction disposers */
    const disposers = this.fieldDisposers.get(fieldPath);
    if (disposers) {
      for (const disposer of disposers) {
        disposer();
      }
      this.fieldDisposers.delete(fieldPath);
    }
  }

  /**
   * 销毁引擎
   */
  dispose(): void {
    for (const [, disposers] of this.fieldDisposers) {
      for (const disposer of disposers) {
        disposer();
      }
    }
    this.fieldDisposers.clear();
    this.depGraph.clear();
  }
}
