import type { FieldPattern, FormPlugin } from '@moluoxixi/core'
import type { FormPrintPluginAPI, FormPrintPluginConfig, FormPrintTarget } from './types'
import { browserPrint } from './browser'

export const PLUGIN_NAME = 'form-print'

const DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_PRINT_PATTERN: FieldPattern = 'preview'

function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

function resolvePrintTarget(target: FormPrintTarget | undefined): string | Element | undefined {
  if (!target) {
    return undefined
  }
  const value = typeof target === 'function' ? target() : target
  if (typeof value === 'string' || isElement(value)) {
    return value
  }
  return undefined
}

async function waitForPreviewRender(): Promise<void> {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    await Promise.resolve()
    return
  }
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

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

export function printPlugin(config: FormPrintPluginConfig = {}): FormPlugin<FormPrintPluginAPI> {
  return {
    name: PLUGIN_NAME,
    install(form) {
      const formWithPrint = form as typeof form & {
        print?: FormPrintPluginAPI['print']
      }

      const api: FormPrintPluginAPI = {
        async print(options = {}) {
          const print = config.adapters?.print ?? browserPrint

          const previousPattern = form.pattern
          const switchPattern = options.switchPattern ?? config.print?.switchPattern ?? true
          const restorePattern = options.restorePattern ?? config.print?.restorePattern ?? true
          const previewPattern = options.previewPattern ?? config.print?.previewPattern ?? DEFAULT_PRINT_PATTERN
          const title = options.title ?? config.print?.title
          const target = resolvePrintTarget(options.target ?? config.print?.target)
          const excludePrefixes = options.excludePrefixes ?? config.excludePrefixes ?? DEFAULT_EXCLUDE_PREFIXES

          if (switchPattern && previousPattern !== previewPattern) {
            form.pattern = previewPattern
            await waitForPreviewRender()
          }

          try {
            const values = toExportData(form.values as Record<string, unknown>, excludePrefixes)
            const json = JSON.stringify(values, null, config.jsonSpace ?? DEFAULT_JSON_SPACE)
            const formatText = options.formatText ?? config.print?.formatText ?? toPrintText
            const text = formatText(values)

            await Promise.resolve(print({
              title,
              values,
              json,
              text,
              form,
              target,
            }))
          }
          finally {
            if (switchPattern && restorePattern && form.pattern !== previousPattern) {
              form.pattern = previousPattern
            }
          }
        },
      }

      formWithPrint.print = api.print

      return {
        api,
        dispose() {
          if (formWithPrint.print === api.print)
            delete formWithPrint.print
        },
      }
    },
  }
}
