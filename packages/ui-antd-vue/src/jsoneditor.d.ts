declare module 'jsoneditor' {
  /**
   * JSONEditor 初始化配置项。
   * 本声明覆盖项目实际使用到的最小能力集合。
   */
  interface JSONEditorOptions {
    /** 编辑器默认模式。 */
    mode?: string
    /** 可切换模式列表。 */
    modes?: string[]
    /** 是否展示主菜单栏。 */
    mainMenuBar?: boolean
    /** 是否展示导航栏。 */
    navigationBar?: boolean
    /** 是否展示状态栏。 */
    statusBar?: boolean
    /** 是否启用搜索。 */
    search?: boolean
    /** 控制是否允许编辑。 */
    onEditable?: () => boolean
  }

  /**
   * JSONEditor 主类声明。
   */
  export default class JSONEditor {
    /**
     * 创建编辑器并挂载到容器。
     *
     * @param container 容器元素。
     * @param options 编辑器初始化配置。
     */
    constructor(container: Element, options?: JSONEditorOptions)
    /**
     * 设置编辑器值。
     *
     * @param value 要写入的数据。
     * @returns 无返回值。
     */
    set(value: unknown): void
    /**
     * 获取当前编辑器值。
     *
     * @returns 当前 JSON 数据。
     */
    get(): unknown
    /**
     * 销毁编辑器实例并释放资源。
     *
     * @returns 无返回值。
     */
    destroy(): void
  }
}
