import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI, FormImportPluginConfig } from './types'
import { ensurePlainObject, parseCSV, parseJSON } from './serialize'

export const PLUGIN_NAME = 'form-import'

const DEFAULT_EXCLUDE_PREFIXES = ['_']

function normalizeImportOptions(
  config: FormImportPluginConfig,
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

export function formImportPlugin(config: FormImportPluginConfig = {}): FormPlugin<FormImportPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form) {
      const api: FormImportPluginAPI = {
        parseImportJSON(input, options = {}) {
          const data = typeof input === 'string'
            ? parseJSON(input, options.reviver)
            : ensurePlainObject(input)
          return createImportResult(data, normalizeImportOptions(config, options))
        },

        parseImportCSV(input, options = {}) {
          const data = parseCSV(input, options)
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

        importCSV(input, options = {}) {
          const parsed = api.parseImportCSV(input, options)
          return api.applyImport(parsed.data, options)
        },
      }

      return {
        api,
      }
    },
  }
}
