declare module 'jsoneditor' {
  /**
   * JSONEditor 初始化配置项。
   * 用于约束低代码设计器中 JSON 编辑器的展示行为与可编辑策略。
   */
  interface JSONEditorOptions {
    /** 编辑器默认模式，例如 `code`、`tree`。 */
    mode?: string
    /** 允许切换的模式列表。 */
    modes?: string[]
    /** 是否显示顶部主菜单。 */
    mainMenuBar?: boolean
    /** 是否显示导航栏。 */
    navigationBar?: boolean
    /** 是否显示状态栏。 */
    statusBar?: boolean
    /** 是否启用搜索功能。 */
    search?: boolean
    /** 编辑能力回调，返回 `true` 表示允许编辑。 */
    onEditable?: () => boolean
  }

  /**
   * JSONEditor 主类声明。
   * 这里仅提供项目所需的最小类型能力，避免引入过重的第三方类型依赖。
   */
  export default class JSONEditor {
    /**
     * 创建 JSON 编辑器实例并挂载到指定容器。
     *
     * @param container 编辑器挂载的 DOM 容器元素。
     * @param options 编辑器初始化选项。
     */
    constructor(container: Element, options?: JSONEditorOptions)
    /**
     * 向编辑器写入新的 JSON 值。
     *
     * @param value 需要展示或编辑的数据。
     * @returns 无返回值。
     */
    set(value: unknown): void
    /**
     * 读取编辑器当前 JSON 值。
     *
     * @returns 当前编辑器中的数据对象。
     */
    get(): unknown
    /**
     * 销毁编辑器实例并释放相关资源。
     *
     * @returns 无返回值。
     */
    destroy(): void
  }
}
