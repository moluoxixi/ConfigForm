declare module 'jsoneditor' {
  interface JSONEditorOptions {
    mode?: string
    modes?: string[]
    mainMenuBar?: boolean
    navigationBar?: boolean
    statusBar?: boolean
    search?: boolean
    onEditable?: () => boolean
  }

  export default class JSONEditor {
    constructor(container: Element, options?: JSONEditorOptions)
    set(value: unknown): void
    get(): unknown
    destroy(): void
  }
}
