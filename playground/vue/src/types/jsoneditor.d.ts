declare module 'jsoneditor' {
  /**
   * JSONEditor 初始化配置项。
   * playground 仅声明示例所需字段，避免依赖完整类型包。
   */
  interface JSONEditorOptions {
    /** 编辑器默认模式。 */
    mode?: string
    /** 可切换模式集合。 */
    modes?: string[]
    /** 是否展示主菜单。 */
    mainMenuBar?: boolean
    /** 是否展示导航栏。 */
    navigationBar?: boolean
    /** 是否展示状态栏。 */
    statusBar?: boolean
    /** 是否启用搜索。 */
    search?: boolean
    /** 是否允许编辑。 */
    onEditable?: () => boolean
  }

  /**
   * JSONEditor 主类声明。
   */
  export default class JSONEditor {
    /**
     * 构造并挂载编辑器实例。
     *
     * @param container 承载编辑器的容器元素。
     * @param options 初始化配置。
     */
    constructor(container: Element, options?: JSONEditorOptions)
    /**
     * 写入编辑器值。
     *
     * @param value 要写入的数据。
     * @returns 无返回值。
     */
    set(value: unknown): void
    /**
     * 读取编辑器值。
     *
     * @returns 当前值。
     */
    get(): unknown
    /**
     * 销毁编辑器。
     *
     * @returns 无返回值。
     */
    destroy(): void
  }
}
