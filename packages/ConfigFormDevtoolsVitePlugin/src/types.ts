import type { SourceMap } from 'magic-string'
import type { ChildProcess } from 'node:child_process'

/** Source location injected into defineField(...) calls during Vite transform. */
export interface FieldSourceMeta {
  /** Stable source id used to match rendered DOM markers with devtools nodes. */
  readonly id: string
  /** Absolute or Vite-normalized source file path. */
  readonly file: string
  /** One-based source line. */
  readonly line: number
  /** One-based source column. */
  readonly column: number
}

/** Devtools tree node categories. */
export type FormDevtoolsNodeKind = 'component' | 'field'

/** Node payload registered by the ConfigForm adapter into the browser devtools bridge. */
export interface FormDevtoolsNode {
  /** Stable node id scoped by form id and node path or field key. */
  id: string
  /** Stable id for the owning ConfigForm instance. */
  formId: string
  /** Human-readable label for the owning form, used by multi-form nav. */
  formLabel?: string
  /** Whether this node binds a field value or only renders component structure. */
  kind: FormDevtoolsNodeKind
  /** Declaration order within the current parent node. */
  order?: number
  /** Bound form value key when kind is field. */
  field?: string
  /** Component name, native tag, or component key when it can be resolved. */
  component?: string
  /** Parent devtools node id for nested slot trees. */
  parentId?: string
  /** Rendered field label when it is statically known. */
  label?: string
  /** Slot name that produced this node. */
  slotName?: string
  /** Injected source location used by open-in-editor. */
  source?: FieldSourceMeta
}

/** Per-node render/update timing metric sent by the adapter. */
export interface FormFieldPatchMetric {
  /** Registered devtools node id. */
  id: string
  /** Patch duration in milliseconds. */
  duration: number
  /** Metric timestamp in performance.now()/Date.now() units. */
  timestamp: number
}

/** Browser bridge installed by the virtual devtools client. */
export interface FormDevtoolsBridge {
  /** Register a new node and its best matching DOM element. */
  registerField: (node: FormDevtoolsNode, element: HTMLElement | null) => void
  /** Update an existing node and its best matching DOM element. */
  updateField: (node: FormDevtoolsNode, element: HTMLElement | null) => void
  /** Record render/update timing for a node. */
  recordPatch: (metric: FormFieldPatchMetric) => void
  /** Remove a node by id. */
  unregisterField: (id: string) => void
}

/** MagicString transform result returned to Vite. */
export interface ConfigFormDevtoolsTransformResult {
  /** Transformed source code. */
  code: string
  /** High-resolution source map generated from the transform. */
  map: SourceMap
}

/** Options for defineField source injection. */
export interface SourceInjectionOptions {
  /** Source code to transform. */
  code: string
  /** Vite module id for the current file. */
  id: string
  /** Optional virtual adapter id used to rewrite ConfigForm imports in dev mode. */
  adapterModuleId?: string
  /** Package names that should be treated as ConfigForm core imports. */
  packageNames?: string[]
}

/** Built-in editor command presets supported by open-in-editor. */
export type EditorPreset = 'code' | 'cursor' | 'webstorm'

/** Fully resolved editor command. */
export interface EditorCommand {
  /** Executable or shell command name. */
  command: string
  /** Command arguments. */
  args: string[]
  /** Whether the command should be launched through a shell. */
  shell?: boolean
}

/** Request payload sent by the devtools browser client to the Vite middleware. */
export interface OpenInEditorPayload {
  /** Source file path to open. */
  file: string
  /** One-based source line. */
  line: number
  /** One-based source column. */
  column: number
}

/** Input used to build an editor command from a source location. */
export interface EditorCommandInput extends OpenInEditorPayload {
  editor?: EditorPreset | string | EditorCommand
}

/** Spawn abstraction used by tests and by the editor launcher. */
export type SpawnEditorProcess = (
  command: string,
  args: string[],
  options: { detached: boolean, shell?: boolean, stdio: 'ignore' },
) => ChildProcess

/** Options for launching source files from the devtools middleware. */
export interface OpenInEditorOptions {
  /** Project root allowed for source-open requests. */
  root: string
  /** Additional allowed roots for monorepo or linked-package source files. */
  allowRoots?: string[]
  /** Editor preset, executable name, or full command override. */
  editor?: EditorPreset | string | EditorCommand
  /** Optional spawn implementation for tests. */
  spawn?: SpawnEditorProcess
}

/** Public Vite plugin options. */
export interface ConfigFormDevtoolsPluginOptions {
  /** ConfigForm package names to rewrite and inspect. */
  packageNames?: string[]
  /** Additional filesystem roots allowed by the open-in-editor endpoint. */
  allowRoots?: string[]
  /** Editor preset, executable name, or command override for source-open. */
  editor?: EditorPreset | string | EditorCommand
}

/** Error thrown for transform-time failures that should surface in Vite. */
export class ConfigFormDevtoolsPluginError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigFormDevtoolsPluginError'
  }
}

/** HTTP-aware error used by the open-in-editor middleware. */
export class ConfigFormDevtoolsHttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'ConfigFormDevtoolsHttpError'
  }
}
