import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI, FormImportPluginOptions } from './types'
import { readFileAsText } from './browser'
import { ensurePlainObject, parseJSON } from './serialize'

export const PLUGIN_NAME = 'form-import'

const DEFAULT_EXCLUDE_PREFIXES = ['_']

/**
 * normalize Import Options：负责“规范化normalize Import Options”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Import Options 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeImportOptions(
  config: FormImportPluginOptions,
  options: Parameters<FormImportPluginAPI['applyImport']>[1] = {},
): {
  strategy: 'merge' | 'shallow' | 'replace'
  allowInternal: boolean
  excludePrefixes: string[]
} {
  return {
    strategy: options.strategy ?? 'merge',
    allowInternal: options.allowInternal ?? false,
    excludePrefixes: options.excludePrefixes ?? config.excludePrefixes ?? DEFAULT_EXCLUDE_PREFIXES,
  }
}

/**
 * split Import Data：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 split Import Data 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function splitImportData(
  data: Record<string, unknown>,
  allowInternal: boolean,
  excludePrefixes: string[],
): { nextData: Record<string, unknown>, skippedKeys: string[] } {
  if (allowInternal) {
    return { nextData: data, skippedKeys: [] }
  }

  const nextData: Record<string, unknown> = {}
  const skippedKeys: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (excludePrefixes.some(prefix => prefix && key.startsWith(prefix))) {
      skippedKeys.push(key)
      continue
    }
    nextData[key] = value
  }
  return { nextData, skippedKeys }
}

/**
 * create Import Result：负责“创建create Import Result”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Import Result 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createImportResult(
  data: Record<string, unknown>,
  normalized: ReturnType<typeof normalizeImportOptions>,
) {
  const { nextData, skippedKeys } = splitImportData(data, normalized.allowInternal, normalized.excludePrefixes)
  return {
    data: nextData,
    appliedKeys: Object.keys(nextData),
    skippedKeys,
    strategy: normalized.strategy,
    allowInternal: normalized.allowInternal,
    excludePrefixes: normalized.excludePrefixes,
  }
}

/**
 * import Plugin：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 import Plugin 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function importPlugin(config: FormImportPluginOptions = {}): FormPlugin<FormImportPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form) {
      const formWithImport = form as typeof form & {
        parseImportJSON?: FormImportPluginAPI['parseImportJSON']
        applyImport?: FormImportPluginAPI['applyImport']
        importJSON?: FormImportPluginAPI['importJSON']
        parseImportJSONFile?: FormImportPluginAPI['parseImportJSONFile']
        importJSONFile?: FormImportPluginAPI['importJSONFile']
      }

      const api: FormImportPluginAPI = {
        parseImportJSON(input, options = {}) {
          const data = typeof input === 'string'
            ? parseJSON(input, options.reviver)
            : ensurePlainObject(input)
          return createImportResult(data, normalizeImportOptions(config, options))
        },

        applyImport(data, options = {}) {
          const normalized = normalizeImportOptions(config, options)
          const result = createImportResult(ensurePlainObject(data), normalized)
          form.setValues(result.data, result.strategy)
          return result
        },

        importJSON(input, options = {}) {
          const parsed = api.parseImportJSON(input, options)
          return api.applyImport(parsed.data, options)
        },

        async parseImportJSONFile(file, options = {}) {
          const content = await readFileAsText(file)
          return api.parseImportJSON(content, options)
        },

        async importJSONFile(file, options = {}) {
          const content = await readFileAsText(file)
          return api.importJSON(content, options)
        },
      }

      formWithImport.parseImportJSON = api.parseImportJSON
      formWithImport.applyImport = api.applyImport
      formWithImport.importJSON = api.importJSON
      formWithImport.parseImportJSONFile = api.parseImportJSONFile
      formWithImport.importJSONFile = api.importJSONFile

      return {
        api,
        dispose() {
          if (formWithImport.parseImportJSON === api.parseImportJSON)
            delete formWithImport.parseImportJSON
          if (formWithImport.applyImport === api.applyImport)
            delete formWithImport.applyImport
          if (formWithImport.importJSON === api.importJSON)
            delete formWithImport.importJSON
          if (formWithImport.parseImportJSONFile === api.parseImportJSONFile)
            delete formWithImport.parseImportJSONFile
          if (formWithImport.importJSONFile === api.importJSONFile)
            delete formWithImport.importJSONFile
        },
      }
    },
  }
}
