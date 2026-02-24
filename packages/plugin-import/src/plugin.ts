import type { FormPlugin } from '@moluoxixi/core'
import type { FormImportPluginAPI, FormImportPluginOptions } from './types'
import { readFileAsText } from './browser'
import { ensurePlainObject, parseJSON } from './serialize'

/**
 * splitImportData：执行当前功能逻辑。
 *
 * @param data 参数 data 的输入说明。
 * @param allowInternal 参数 allowInternal 的输入说明。
 * @param excludePrefixes 参数 excludePrefixes 的输入说明。
 *
 * @returns 返回当前功能的处理结果。
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
 * create Import Result：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-import/src/plugin.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param data 参数 `data`用于提供当前函数执行所需的输入信息。
 * @param normalized 参数 `normalized`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * import Plugin：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-import/src/plugin.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param [config] 参数 `config`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function importPlugin(config: FormImportPluginOptions = {}): FormPlugin<FormImportPluginAPI> {
  return {
    name: PLUGIN_NAME,
    /**
     * install：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/plugin-import/src/plugin.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     * @param form 参数 `form`用于提供表单上下文或实例，支撑状态读写与生命周期调用。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    install(form) {
      const formWithImport = form as typeof form & {
        parseImportJSON?: FormImportPluginAPI['parseImportJSON']
        applyImport?: FormImportPluginAPI['applyImport']
        importJSON?: FormImportPluginAPI['importJSON']
        parseImportJSONFile?: FormImportPluginAPI['parseImportJSONFile']
        importJSONFile?: FormImportPluginAPI['importJSONFile']
      }

      const api: FormImportPluginAPI = {
        /**
         * parse Import JSON：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         * @param input 参数 `input`用于提供当前函数执行所需的输入信息。
         * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
         * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
         */
        parseImportJSON(input, options = {}) {
          const data = typeof input === 'string'
            ? parseJSON(input, options.reviver)
            : ensurePlainObject(input)
          return createImportResult(data, normalizeImportOptions(config, options))
        },

        /**
         * apply Import：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         * @param data 参数 `data`用于提供当前函数执行所需的输入信息。
         * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
         * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
         */
        applyImport(data, options = {}) {
          const normalized = normalizeImportOptions(config, options)
          const result = createImportResult(ensurePlainObject(data), normalized)
          form.setValues(result.data, result.strategy)
          return result
        },

        /**
         * import JSON：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         * @param input 参数 `input`用于提供当前函数执行所需的输入信息。
         * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
         * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
         */
        importJSON(input, options = {}) {
          const parsed = api.parseImportJSON(input, options)
          return api.applyImport(parsed.data, options)
        },

        /**
         * parse Import JSONFile：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         * @param file 参数 `file`用于提供当前函数执行所需的输入信息。
         * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
         * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
         */
        async parseImportJSONFile(file, options = {}) {
          const content = await readFileAsText(file)
          return api.parseImportJSON(content, options)
        },

        /**
         * import JSONFile：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         * @param file 参数 `file`用于提供当前函数执行所需的输入信息。
         * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
         * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
         */
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
        /**
         * dispose：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-import/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         */
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
