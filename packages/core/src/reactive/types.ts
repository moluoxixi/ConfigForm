import type { Disposer } from '../shared'

/** 计算属性引用 */
export interface ComputedRef<T = unknown> {
  readonly value: T
}

/** Reaction 配置 */
export interface ReactionOptions {
  /** 防抖延迟（ms） */
  debounce?: number
  /** 首次是否立即执行 effect */
  fireImmediately?: boolean
  /** 自定义比较函数，决定是否触发 effect */
  equals?: (a: unknown, b: unknown) => boolean
}

/**
 * 响应式适配器协议
 *
 * 核心抽象层：定义表单系统所需的响应式原语。
 * 由各框架原生实现（MobX / Vue Reactivity / 未来的 Solid 等）。
 */
export interface ReactiveAdapter {
  /** 适配器名称（调试用） */
  readonly name: string

  /**
   * 将对象转为深度响应式
   * - MobX: observable()
   * - Vue: reactive()
   */
  observable: <T extends object>(target: T) => T

  /**
   * 浅层响应式（仅第一层属性追踪）
   * - MobX: observable.shallow()
   * - Vue: shallowReactive()
   */
  shallowObservable: <T extends object>(target: T) => T

  /**
   * 计算属性（依赖自动追踪，惰性求值）
   * - MobX: computed()
   * - Vue: computed()
   */
  computed: <T>(getter: () => T) => ComputedRef<T>

  /**
   * 自动运行：立即执行函数，自动追踪内部访问的响应式属性
   * 当依赖变化时自动重新执行
   * - MobX: autorun()
   * - Vue: watchEffect()
   * @returns 清理函数
   */
  autorun: (effect: () => void) => Disposer

  /**
   * 条件反应：当 track 返回值变化时执行 effect
   * - MobX: reaction()
   * - Vue: watch()
   * @returns 清理函数
   */
  reaction: <T>(
    track: () => T,
    effect: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ) => Disposer

  /**
   * 批量更新：多次状态变更合并为一次通知
   * - MobX: runInAction()
   * - Vue: 不需要（Vue 的 reactivity 自带微任务批处理）
   */
  batch: (fn: () => void) => void

  /**
   * 标记为动作（MobX 需要，Vue 不需要）
   * - MobX: action()
   * - Vue: 直接返回原函数
   */
  action: <T extends (...args: any[]) => any>(fn: T) => T

  /**
   * 使类实例变为响应式（与 observable 的区别）
   *
   * observable() 用于纯数据对象（form.values 等），
   * makeObservable() 用于类实例（Form / Field），保留原型链和方法。
   *
   * - MobX: makeAutoObservable(target)，原地修改，返回同一引用
   * - Vue: reactive(target)，返回新的 Proxy
   *
   * **调用者必须使用返回值**，因为 Vue 返回的是新引用。
   */
  makeObservable: <T extends object>(target: T) => T
}
