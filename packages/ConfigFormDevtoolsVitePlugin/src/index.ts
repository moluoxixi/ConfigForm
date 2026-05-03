import type { Plugin } from 'vite'
import type { ConfigFormDevtoolsPluginOptions } from './types'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOpenInEditorMiddleware } from './openInEditor'
import { transformDefineFieldSource } from './sourceInject'

const VIRTUAL_CLIENT_ID = 'virtual:config-form-devtools/client'
const RESOLVED_VIRTUAL_CLIENT_ID = `\0${VIRTUAL_CLIENT_ID}`
const VIRTUAL_CONFIG_FORM_ID = 'virtual:config-form-devtools/config-form'
const RESOLVED_VIRTUAL_CONFIG_FORM_ID = `\0${VIRTUAL_CONFIG_FORM_ID}`
const PUBLIC_CLIENT_ID = `/@id/__x00__${VIRTUAL_CLIENT_ID}`

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

function resolvePackageEntry(metaUrl: string, baseName: string): string {
  const modulePath = fileURLToPath(metaUrl)
  const moduleDir = dirname(modulePath)
  const extension = normalizePath(modulePath).endsWith('/src/index.ts') ? 'ts' : 'js'
  return normalizePath(resolve(moduleDir, `${baseName}.${extension}`))
}

const CLIENT_ENTRY = resolvePackageEntry(import.meta.url, 'client')
const ADAPTER_ENTRY = resolvePackageEntry(import.meta.url, 'adapter')

function shouldTransform(id: string): boolean {
  if (id.includes('?'))
    return false

  const cleanId = normalizePath(id.split('?')[0])
  return !cleanId.includes('/node_modules/')
    && /\.(?:[cm]?[jt]sx?|vue)$/.test(cleanId)
}

export function configFormDevtools(options: ConfigFormDevtoolsPluginOptions = {}): Plugin {
  const corePackageName = options.packageNames?.[0] ?? '@moluoxixi/config-form'

  return {
    apply: 'serve',
    enforce: 'pre',
    name: 'moluoxixi:config-form-devtools',
    configureServer(server) {
      server.middlewares.use(
        '/__config-form-devtools/open',
        createOpenInEditorMiddleware({
          allowRoots: options.allowRoots,
          editor: options.editor,
          root: server.config.root,
        }),
      )
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_CLIENT_ID)
        return `import { installConfigFormDevtools } from ${JSON.stringify(CLIENT_ENTRY)};\ninstallConfigFormDevtools();`

      if (id === RESOLVED_VIRTUAL_CONFIG_FORM_ID) {
        return [
          `import { ConfigForm as CoreConfigForm, collectFieldConfigs } from ${JSON.stringify(corePackageName)};`,
          `import { createDevtoolsConfigFormAdapter } from ${JSON.stringify(ADAPTER_ENTRY)};`,
          `export * from ${JSON.stringify(corePackageName)};`,
          'export const ConfigForm = createDevtoolsConfigFormAdapter({',
          '  ConfigForm: CoreConfigForm,',
          '  collectFieldConfigs,',
          '});',
        ].join('\n')
      }

      return null
    },
    resolveId(id) {
      if (id === VIRTUAL_CLIENT_ID)
        return RESOLVED_VIRTUAL_CLIENT_ID
      if (id === VIRTUAL_CONFIG_FORM_ID)
        return RESOLVED_VIRTUAL_CONFIG_FORM_ID
      return null
    },
    transform(code, id) {
      if (!shouldTransform(id))
        return null

      return transformDefineFieldSource({
        code,
        id,
        adapterModuleId: VIRTUAL_CONFIG_FORM_ID,
        packageNames: options.packageNames,
      })
    },
    transformIndexHtml() {
      return [
        {
          children: 'window.__CONFIG_FORM_DEVTOOLS_PENDING__ = true;',
          injectTo: 'head-prepend',
          tag: 'script',
        },
        {
          attrs: {
            src: PUBLIC_CLIENT_ID,
            type: 'module',
          },
          injectTo: 'head-prepend',
          tag: 'script',
        },
      ]
    },
  }
}

export const configFormDevtoolsVitePlugin = configFormDevtools
