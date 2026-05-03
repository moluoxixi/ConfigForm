import type { SourceInjectionOptions } from './types'
import { createHash } from 'node:crypto'
import { parse } from '@babel/parser'
import { parse as parseSfc } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { ConfigFormDevtoolsPluginError } from './types'

const DEFAULT_PACKAGE_NAMES = ['@moluoxixi/config-form']
const SUPPORTED_EXTENSIONS = /\.(?:[cm]?[jt]sx?|vue)$/

interface ScriptSegment {
  content: string
  offset: number
  line: number
  column: number
}

interface InjectionEdit {
  end?: number
  index: number
  text: string
}

interface AstNode {
  type: string
  start?: number | null
  end?: number | null
  loc?: {
    start: {
      line: number
      column: number
    }
  } | null
  [key: string]: unknown
}

interface ImportDeclarationNode extends AstNode {
  source: AstNode & { value?: unknown }
  specifiers: AstNode[]
}

interface ImportSpecifierNode extends AstNode {
  imported?: AstNode & { name?: string }
  local?: AstNode & { name?: string }
}

interface CallExpressionNode extends AstNode {
  callee?: AstNode & { name?: string }
  arguments?: AstNode[]
}

interface ObjectExpressionNode extends AstNode {
  properties?: AstNode[]
}

function cleanId(id: string): string {
  return id.split('?')[0].replace(/\\/g, '/')
}

function normalizeFilePath(id: string): string {
  return cleanId(id)
}

function createSourceId(file: string, line: number, column: number): string {
  return createHash('sha1')
    .update(`${file}:${line}:${column}`)
    .digest('hex')
    .slice(0, 12)
}

function parseScript(content: string, id: string): AstNode {
  try {
    return parse(content, {
      errorRecovery: false,
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
      sourceFilename: id,
      sourceType: 'module',
    }) as unknown as AstNode
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new ConfigFormDevtoolsPluginError(`[config-form-devtools] Failed to parse ${id}: ${message}`)
  }
}

function isImportedDefineField(node: AstNode): node is ImportSpecifierNode {
  return node.type === 'ImportSpecifier'
    && (node as ImportSpecifierNode).imported?.type === 'Identifier'
    && (node as ImportSpecifierNode).imported?.name === 'defineField'
    && typeof (node as ImportSpecifierNode).local?.name === 'string'
}

function collectDefineFieldLocals(ast: AstNode, packageNames: string[]): Set<string> {
  const locals = new Set<string>()
  const body = (ast as { program?: { body?: AstNode[] } }).program?.body ?? []

  for (const node of body) {
    if (node.type !== 'ImportDeclaration')
      continue

    const declaration = node as ImportDeclarationNode
    if (typeof declaration.source.value !== 'string')
      continue
    if (!packageNames.includes(declaration.source.value))
      continue

    for (const specifier of declaration.specifiers) {
      if (isImportedDefineField(specifier))
        locals.add(specifier.local?.name ?? 'defineField')
    }
  }

  return locals
}

function collectImportSourceEdits(
  segment: ScriptSegment,
  id: string,
  packageNames: string[],
  adapterModuleId: string | undefined,
): InjectionEdit[] {
  if (!adapterModuleId)
    return []

  const ast = parseScript(segment.content, id)
  const edits: InjectionEdit[] = []
  const body = (ast as { program?: { body?: AstNode[] } }).program?.body ?? []

  for (const node of body) {
    if (node.type !== 'ImportDeclaration')
      continue

    const declaration = node as ImportDeclarationNode
    if (typeof declaration.source.value !== 'string')
      continue
    if (!packageNames.includes(declaration.source.value))
      continue
    if (declaration.source.start == null || declaration.source.end == null) {
      throw new ConfigFormDevtoolsPluginError(
        `[config-form-devtools] Missing import source location in ${id}`,
      )
    }

    edits.push({
      end: segment.offset + declaration.source.end,
      index: segment.offset + declaration.source.start,
      text: JSON.stringify(adapterModuleId),
    })
  }

  return edits
}

function getObjectKeyName(node: AstNode): string | undefined {
  if (node.type === 'Identifier' && typeof (node as { name?: unknown }).name === 'string')
    return (node as unknown as { name: string }).name
  if (node.type === 'StringLiteral' && typeof (node as { value?: unknown }).value === 'string')
    return (node as unknown as { value: string }).value
  return undefined
}

function hasSourceProperty(node: ObjectExpressionNode): boolean {
  return (node.properties ?? []).some((property) => {
    if (property.type !== 'ObjectProperty' && property.type !== 'ObjectMethod')
      return false
    const key = (property as { key?: AstNode }).key
    return key ? getObjectKeyName(key) === '__source' : false
  })
}

function walkAst(node: AstNode, visitor: (node: AstNode) => void) {
  visitor(node)

  for (const [key, value] of Object.entries(node)) {
    if (
      key === 'loc'
      || key === 'start'
      || key === 'end'
      || key === 'extra'
      || key === 'comments'
      || key === 'leadingComments'
      || key === 'innerComments'
      || key === 'trailingComments'
    ) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && typeof (item as AstNode).type === 'string')
          walkAst(item as AstNode, visitor)
      }
    }
    else if (value && typeof value === 'object' && typeof (value as AstNode).type === 'string') {
      walkAst(value as AstNode, visitor)
    }
  }
}

function toAbsolutePosition(segment: ScriptSegment, loc: NonNullable<AstNode['loc']>['start']) {
  const line = segment.line + loc.line - 1
  const column = loc.line === 1
    ? segment.column + loc.column + 1
    : loc.column + 1
  return { column, line }
}

function createSourceText(file: string, line: number, column: number): string {
  const id = createSourceId(file, line, column)
  return `__source: { id: ${JSON.stringify(id)}, file: ${JSON.stringify(file)}, line: ${line}, column: ${column} }`
}

function getInjectionPrefix(content: string, insertionIndex: number): string {
  const previous = content.slice(0, insertionIndex).match(/\S(?=\s*$)/)?.[0]
  if (previous === '{' || previous === ',')
    return ' '
  return ', '
}

function collectInjectionEdits(segment: ScriptSegment, id: string, packageNames: string[]): InjectionEdit[] {
  const ast = parseScript(segment.content, id)
  const defineFieldLocals = collectDefineFieldLocals(ast, packageNames)
  const edits: InjectionEdit[] = []

  if (defineFieldLocals.size === 0)
    return edits

  walkAst(ast, (node) => {
    if (node.type !== 'CallExpression')
      return

    const call = node as CallExpressionNode
    if (call.callee?.type !== 'Identifier' || !defineFieldLocals.has(call.callee.name ?? ''))
      return

    const config = call.arguments?.[0]
    if (!config || config.type !== 'ObjectExpression')
      return
    if (config.end == null || config.loc == null)
      throw new ConfigFormDevtoolsPluginError(`[config-form-devtools] Missing source location for defineField in ${id}`)

    const objectConfig = config as ObjectExpressionNode
    if (hasSourceProperty(objectConfig))
      throw new ConfigFormDevtoolsPluginError(`[config-form-devtools] defineField in ${id} already contains __source`)

    const file = normalizeFilePath(id)
    const { column, line } = toAbsolutePosition(segment, config.loc.start)
    const insertionIndex = config.end - 1
    const prefix = getInjectionPrefix(segment.content, insertionIndex)
    edits.push({
      index: segment.offset + insertionIndex,
      text: `${prefix}${createSourceText(file, line, column)}`,
    })
  })

  return edits
}

function createScriptSegments(code: string, id: string): ScriptSegment[] {
  if (!cleanId(id).endsWith('.vue')) {
    return [{
      column: 0,
      content: code,
      line: 1,
      offset: 0,
    }]
  }

  const parsed = parseSfc(code, { filename: id })
  if (parsed.errors.length > 0) {
    const message = parsed.errors
      .map(error => error instanceof Error ? error.message : String(error))
      .join('; ')
    throw new ConfigFormDevtoolsPluginError(`[config-form-devtools] Failed to parse Vue SFC ${id}: ${message}`)
  }

  return [parsed.descriptor.script, parsed.descriptor.scriptSetup]
    .filter(segment => Boolean(segment))
    .map(segment => ({
      column: segment!.loc.start.column,
      content: segment!.content,
      line: segment!.loc.start.line,
      offset: segment!.loc.start.offset,
    }))
}

export function transformDefineFieldSource(options: SourceInjectionOptions) {
  if (options.id.includes('?'))
    return null

  const id = cleanId(options.id)
  if (!SUPPORTED_EXTENSIONS.test(id))
    return null

  const packageNames = options.packageNames ?? DEFAULT_PACKAGE_NAMES
  const segments = createScriptSegments(options.code, id)
  const edits = segments.flatMap(segment => [
    ...collectImportSourceEdits(segment, id, packageNames, options.adapterModuleId),
    ...collectInjectionEdits(segment, id, packageNames),
  ])

  if (edits.length === 0)
    return null

  const source = new MagicString(options.code)
  for (const edit of edits) {
    if (edit.end == null)
      source.appendLeft(edit.index, edit.text)
    else
      source.overwrite(edit.index, edit.end, edit.text)
  }

  return {
    code: source.toString(),
    map: source.generateMap({
      hires: true,
      source: id,
    }),
  }
}
