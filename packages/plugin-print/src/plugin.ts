import type { FieldPattern, FormPlugin } from '@moluoxixi/core'
import type { FormPrintPluginAPI, FormPrintPluginConfig, FormPrintTarget } from './types'
import { cloneWithoutKeyPrefixes, isPlainObject } from '@moluoxixi/core'
import { browserPrint } from './browser'

export const PLUGIN_NAME = 'form-print'

const DEFAULT_EXCLUDE_PREFIXES = ['_']
const DEFAULT_JSON_SPACE = 2
const DEFAULT_PRINT_PATTERN: FieldPattern = 'preview'

/**
 * is Element：负责“判断is Element”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Element 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

/**
 * resolve Print Target：负责“解析resolve Print Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Print Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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

/**
 * to Export Data：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Export Data 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toExportData(values: Record<string, unknown>, excludePrefixes: string[]): Record<string, unknown> {
  const cloned = cloneWithoutKeyPrefixes(values, excludePrefixes)
  return isPlainObject(cloned) ? cloned : {}
}

/**
 * to Print Text：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Print Text 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toPrintText(values: Record<string, unknown>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n')
}

/**
 * print Plugin：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 print Plugin 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
