import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI, FormImportPluginOptions } from './types'
import { readFileAsText } from './browser'
import { ensurePlainObject, parseJSON } from './serialize'

export const PLUGIN_NAME = 'form-import'

const DEFAULT_EXCLUDE_PREFIXES = ['_']

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
