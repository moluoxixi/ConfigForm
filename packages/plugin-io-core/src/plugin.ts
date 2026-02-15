import type { FieldPattern, FormInstance, FormPlugin } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'
import type {
  FormIOExportPreview,
  FormIOExportPreviewOptions,
  FormIOImportOptions,
  FormIOImportResult,
  FormIOPluginAPI,
  FormIOPluginConfig,
  FormIOPrintOptions,
} from './types'
import { ensurePlainObject, parseCSV, parseJSON, toCSV } from './serialize'

export const PLUGIN_NAME = 'form-io'

const DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_CSV_DELIMITER = ','
const DEFAULT_CSV_LINE_BREAK = '\n'
const DEFAULT_FILE_NAME_BASE = 'config-form'
const DEFAULT_PRINT_PATTERN: FieldPattern = 'preview'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneWithoutInternal(value: unknown, excludePrefixes: string[]): unknown {
  if (Array.isArray(value)) {
    return value.map(item => cloneWithoutInternal(item, excludePrefixes))
  }
  if (!isRecord(value)) {
    return value
  }

  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    if (excludePrefixes.some(prefix => prefix && key.startsWith(prefix))) {
      continue
    }
    result[key] = cloneWithoutInternal(child, excludePrefixes)
  }
  return result
}

function toExportData(values: Record<string, unknown>, excludePrefixes: string[]): Record<string, unknown> {
  const cloned = cloneWithoutInternal(values, excludePrefixes)
  return isRecord(cloned) ? cloned : {}
}

function toPrintText(values: Record<string, unknown>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n')
}

function resolveExcludePrefixes(config: FormIOPluginConfig, options?: { excludePrefixes?: string[] }): string[] {
  return options?.excludePrefixes ?? config.excludePrefixes ?? DEFAULT_EXCLUDE_PREFIXES
}

function resolveFileNameBase(config: FormIOPluginConfig): string {
  const base = typeof config.filenameBase === 'function' ? config.filenameBase() : config.filenameBase
  return base || DEFAULT_FILE_NAME_BASE
}

function normalizeImportOptions(
  config: FormIOPluginConfig,
  options: FormIOImportOptions = {},
): Required<Pick<FormIOImportOptions, 'allowInternal'>> & {
  strategy: NonNullable<FormIOImportOptions['strategy']>
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
): FormIOImportResult {
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

function createExportPreview(
  api: Pick<FormIOPluginAPI, 'getExportData'>,
  config: FormIOPluginConfig,
  options: FormIOExportPreviewOptions = {},
): FormIOExportPreview {
  const data = api.getExportData(options)
  return {
    data,
    json: JSON.stringify(data, null, options.jsonSpace ?? config.jsonSpace ?? DEFAULT_JSON_SPACE),
    csv: toCSV(data, {
      delimiter: options.csvDelimiter ?? config.csvDelimiter ?? DEFAULT_CSV_DELIMITER,
      lineBreak: options.csvLineBreak ?? config.csvLineBreak ?? DEFAULT_CSV_LINE_BREAK,
      excludePrefixes: options.excludePrefixes,
    }),
  }
}

export function formIOPlugin(config: FormIOPluginConfig = {}): FormPlugin<FormIOPluginAPI> {
  return {
    name: PLUGIN_NAME,

    install(form: FormInstance) {
      const previewSubscribers = new Map<(preview: FormIOExportPreview) => void, FormIOExportPreviewOptions | undefined>()

      const api: FormIOPluginAPI = {
        getExportData(options) {
          const excludePrefixes = resolveExcludePrefixes(config, options)
          return toExportData(form.values as Record<string, unknown>, excludePrefixes)
        },

        getExportPreview(options) {
          return createExportPreview(api, config, options)
        },

        subscribeExportPreview(listener, options) {
          previewSubscribers.set(listener, options)
          listener(api.getExportPreview(options))
          return () => {
            previewSubscribers.delete(listener)
          }
        },

        exportJSON(options) {
          const data = api.getExportData(options)
          const space = options?.space ?? config.jsonSpace ?? DEFAULT_JSON_SPACE
          return JSON.stringify(data, null, space)
        },

        exportCSV(options) {
          const data = api.getExportData(options)
          return toCSV(data, {
            ...options,
            delimiter: options?.delimiter ?? config.csvDelimiter ?? DEFAULT_CSV_DELIMITER,
            lineBreak: options?.lineBreak ?? config.csvLineBreak ?? DEFAULT_CSV_LINE_BREAK,
          })
        },

        async downloadJSON(options) {
          const download = config.adapters?.download
          if (!download) {
            throw new Error('[plugin-io-core] Missing download adapter. Provide adapters.download in plugin config.')
          }
          const content = api.exportJSON(options)
          const filename = options?.filename ?? `${resolveFileNameBase(config)}.json`
          await Promise.resolve(download({
            filename,
            mimeType: 'application/json;charset=utf-8',
            content,
          }))
        },

        async downloadCSV(options) {
          const download = config.adapters?.download
          if (!download) {
            throw new Error('[plugin-io-core] Missing download adapter. Provide adapters.download in plugin config.')
          }
          const content = api.exportCSV(options)
          const filename = options?.filename ?? `${resolveFileNameBase(config)}.csv`
          await Promise.resolve(download({
            filename,
            mimeType: 'text/csv;charset=utf-8',
            content,
          }))
        },

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

        async print(options: FormIOPrintOptions = {}) {
          const print = config.adapters?.print
          if (!print) {
            throw new Error('[plugin-io-core] Missing print adapter. Provide adapters.print in plugin config.')
          }

          const previousPattern = form.pattern
          const switchPattern = options.switchPattern ?? config.print?.switchPattern ?? true
          const restorePattern = options.restorePattern ?? config.print?.restorePattern ?? true
          const previewPattern = options.previewPattern ?? config.print?.previewPattern ?? DEFAULT_PRINT_PATTERN
          const title = options.title ?? config.print?.title

          if (switchPattern && previousPattern !== previewPattern) {
            form.pattern = previewPattern
            await Promise.resolve()
          }

          try {
            const preview = api.getExportPreview({
              excludePrefixes: options.excludePrefixes,
              jsonSpace: config.jsonSpace ?? DEFAULT_JSON_SPACE,
              csvDelimiter: config.csvDelimiter ?? DEFAULT_CSV_DELIMITER,
              csvLineBreak: config.csvLineBreak ?? DEFAULT_CSV_LINE_BREAK,
            })
            const formatText = options.formatText ?? config.print?.formatText ?? toPrintText
            const text = formatText(preview.data)

            await Promise.resolve(print({
              title,
              values: preview.data,
              json: preview.json,
              text,
              form,
            }))
          }
          finally {
            if (switchPattern && restorePattern && form.pattern !== previousPattern) {
              form.pattern = previousPattern
            }
          }
        },
      }

      const notifyExportPreviewSubscribers = (): void => {
        for (const [listener, options] of previewSubscribers.entries()) {
          listener(api.getExportPreview(options))
        }
      }

      const disposeValues = form.onValuesChange(() => {
        notifyExportPreviewSubscribers()
      })
      const disposeReset = form.on(FormLifeCycle.ON_FORM_RESET, () => {
        notifyExportPreviewSubscribers()
      })
      const disposeMount = form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
        notifyExportPreviewSubscribers()
      })

      return {
        api,
        dispose() {
          previewSubscribers.clear()
          disposeValues()
          disposeReset()
          disposeMount()
        },
      }
    },
  }
}
