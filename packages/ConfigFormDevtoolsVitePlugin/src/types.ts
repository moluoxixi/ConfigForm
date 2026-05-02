import type { SourceMap } from 'magic-string'
import type { ChildProcess } from 'node:child_process'

export interface FieldSourceMeta {
  id: string
  file: string
  line: number
  column: number
}

export type FormDevtoolsNodeKind = 'component' | 'field'

export interface FormDevtoolsNode {
  id: string
  formId: string
  kind: FormDevtoolsNodeKind
  field?: string
  component?: string
  parentId?: string
  label?: string
  slotName?: string
  source?: FieldSourceMeta
}

export interface FormFieldPatchMetric {
  id: string
  duration: number
  timestamp: number
}

export interface FormDevtoolsBridge {
  registerField: (node: FormDevtoolsNode, element: HTMLElement | null) => void
  updateField: (node: FormDevtoolsNode, element: HTMLElement | null) => void
  recordPatch: (metric: FormFieldPatchMetric) => void
  unregisterField: (id: string) => void
}

export interface ConfigFormDevtoolsTransformResult {
  code: string
  map: SourceMap
}

export interface SourceInjectionOptions {
  code: string
  id: string
  packageNames?: string[]
}

export type EditorPreset = 'code' | 'cursor' | 'webstorm'

export interface EditorCommand {
  command: string
  args: string[]
  shell?: boolean
}

export interface OpenInEditorPayload {
  file: string
  line: number
  column: number
}

export interface EditorCommandInput extends OpenInEditorPayload {
  editor?: EditorPreset | string | EditorCommand
}

export type SpawnEditorProcess = (
  command: string,
  args: string[],
  options: { detached: boolean, shell?: boolean, stdio: 'ignore' },
) => ChildProcess

export interface OpenInEditorOptions {
  root: string
  allowRoots?: string[]
  editor?: EditorPreset | string | EditorCommand
  spawn?: SpawnEditorProcess
}

export interface ConfigFormDevtoolsPluginOptions {
  packageNames?: string[]
  allowRoots?: string[]
  editor?: EditorPreset | string | EditorCommand
}

export class ConfigFormDevtoolsPluginError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigFormDevtoolsPluginError'
  }
}

export class ConfigFormDevtoolsHttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'ConfigFormDevtoolsHttpError'
  }
}
