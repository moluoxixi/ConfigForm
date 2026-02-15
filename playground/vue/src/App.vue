<template>
  <div style="max-width: 1400px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">
      ConfigForm - Vue Playground
    </h1>
    <p style="color: #666; margin-bottom: 16px; font-size: 13px;">
      基于 @vue/reactivity 的响应式配置化表单 · {{ totalScenes }} 个场景 × 2 套 UI 库 · ConfigForm + SchemaField 递归渲染
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 8px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333; font-size: 13px;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs" :key="lib.key"
        :style="{ padding: '4px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: currentUI === lib.key ? lib.color : '#fff',
                  color: currentUI === lib.key ? '#fff' : '#333',
                  border: `2px solid ${currentUI === lib.key ? lib.color : '#ddd'}` }"
        @click="currentUI = lib.key"
      >
        {{ lib.label }}
      </button>
    </div>

    <!-- 主体：左侧导航 + 右侧内容 -->
    <div style="display: flex; gap: 16px;">
      <!-- 左侧导航 -->
      <div style="width: 280px; flex-shrink: 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="max-height: calc(100vh - 180px); overflow: auto; padding: 8px;">
          <div v-for="group in sceneGroups" :key="group.key" style="margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #999; padding: 2px 4px;">
              {{ group.label }}
            </div>
            <button v-for="name in group.items" :key="name" :style="navBtnStyle(name)" @click="currentDemo = name">
              {{ name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; min-height: 400px;">
        <SceneRenderer
          v-if="sceneConfig && currentAdapter"
          :key="`${currentDemo}-${currentUI}`"
          :config="sceneConfig"
          :title="sceneTitle"
          :description="sceneDescription"
          :extra-plugins="scenePlugins"
          :status-tabs="currentAdapter.StatusTabs"
        >
          <template #header-extra>
            <div
              v-if="i18nRuntime && localeOptions.length"
              style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"
            >
              <span style="font-size: 13px; font-weight: 600; color: #555;">语言：</span>
              <div style="display: flex; gap: 4px;">
                <button
                  v-for="opt in localeOptions"
                  :key="opt.value"
                  :style="{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: locale === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
                    background: locale === opt.value ? '#e6f4ff' : '#fff',
                    color: locale === opt.value ? '#1677ff' : '#333',
                  }"
                  @click="switchLocale(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div
              v-if="ioRuntime"
              style="margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;"
            >
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 600; color: #555;">操作：</span>
                <button @click="exportJson">导出 JSON</button>
                <button @click="exportCsv">导出 CSV</button>
                <button @click="openJsonImport">导入 JSON</button>
                <button @click="openCsvImport">导入 CSV</button>
                <label style="font-size: 12px; color: #555;">
                  导入策略：
                  <select v-model="importStrategy">
                    <option value="merge">merge</option>
                    <option value="shallow">shallow</option>
                    <option value="replace">replace</option>
                  </select>
                </label>
                <button @click="printForm">打印预览</button>
                <input
                  ref="jsonFileInput"
                  type="file"
                  accept=".json,application/json"
                  style="display: none;"
                  @change="onJsonFileChange"
                >
                <input
                  ref="csvFileInput"
                  type="file"
                  accept=".csv,text/csv"
                  style="display: none;"
                  @change="onCsvFileChange"
                >
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">JSON 导出预览</div>
                  <textarea
                    :value="exportJsonPreview"
                    readonly
                    rows="8"
                    style="width: 100%; font-family: monospace; font-size: 12px;"
                  />
                </div>
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">CSV 导出预览</div>
                  <textarea
                    :value="exportCsvPreview"
                    readonly
                    rows="8"
                    style="width: 100%; font-family: monospace; font-size: 12px;"
                  />
                </div>
              </div>
              <div v-if="importPreview" style="border-top: 1px dashed #d0d7de; padding-top: 8px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                  {{ importPreview.type }} 导入预览：可导入 {{ importPreview.appliedKeys.length }} 字段
                  <template v-if="importPreview.skippedKeys.length">
                    ，跳过 {{ importPreview.skippedKeys.join(', ') }}
                  </template>
                </div>
                <textarea
                  :value="importPreview.raw"
                  readonly
                  rows="5"
                  style="width: 100%; font-family: monospace; font-size: 12px; margin-bottom: 8px;"
                />
                <div style="display: flex; gap: 8px;">
                  <button @click="applyImportPreview">应用导入</button>
                  <button @click="clearImportPreview">清空导入预览</button>
                </div>
              </div>
              <div v-if="ioMessage" style="font-size: 12px; color: #666; margin-top: 8px;">{{ ioMessage }}</div>
            </div>
          </template>
        </SceneRenderer>
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          {{ loading ? '加载中...' : '请选择场景' }}
        </div>
      </div>
    </div>

    <!-- DevTools 浮动面板 -->
    <DevToolsFloating />
  </div>
</template>

<script setup lang="ts">
import type { DevToolsPluginAPI } from '@moluoxixi/plugin-devtools'
import type { FormPlugin } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { UIAdapter, UILib } from './ui'
import { DevToolsPanel } from '@moluoxixi/plugin-devtools-vue'
import { createVueMessageI18nRuntime } from '@moluoxixi/plugin-i18n-vue'
import { createVueFormIORuntime } from '@moluoxixi/plugin-io-vue'
import { registerComponent } from '@moluoxixi/vue'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import { computed, defineComponent, h, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { CodeEditor, ColorPicker, CronEditor, PreviewColorPicker, SignaturePad } from './components/custom'
import SceneRenderer from './components/SceneRenderer.vue'
import { adapters } from './ui'

/** 确保全局 Hook 存在（与 plugin 中逻辑一致，保证面板先于插件挂载时也能订阅） */
interface HookType { forms: Map<string, DevToolsPluginAPI>, onChange: (fn: (forms: Map<string, DevToolsPluginAPI>) => void) => () => void }
function getOrCreateHook(): HookType {
  const g = window as unknown as Record<string, unknown>
  if (!g.__CONFIGFORM_DEVTOOLS_HOOK__) {
    const listeners = new Set<(forms: Map<string, DevToolsPluginAPI>) => void>()
    const hook = {
      forms: new Map<string, DevToolsPluginAPI>(),
      register(id: string, api: DevToolsPluginAPI) {
        hook.forms.set(id, api)
        listeners.forEach(fn => fn(hook.forms))
      },
      unregister(id: string) {
        hook.forms.delete(id)
        listeners.forEach(fn => fn(hook.forms))
      },
      onChange(fn: (forms: Map<string, DevToolsPluginAPI>) => void) {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
    }
    g.__CONFIGFORM_DEVTOOLS_HOOK__ = hook
  }
  return g.__CONFIGFORM_DEVTOOLS_HOOK__ as HookType
}

/** DevTools 浮动面板包装器：通过全局 Hook 的 onChange 事件驱动更新（零轮询） */
const DevToolsFloating = defineComponent({
  name: 'DevToolsFloating',
  setup() {
    const api = shallowRef<DevToolsPluginAPI | null>(null)
    let dispose: (() => void) | null = null

    onMounted(() => {
      const hook = getOrCreateHook()
      const update = (forms: Map<string, DevToolsPluginAPI>): void => {
        api.value = forms.size > 0 ? forms.values().next().value! : null
      }
      update(hook.forms)
      dispose = hook.onChange(update)
    })

    onUnmounted(() => {
      dispose?.()
    })

    return () => api.value ? h(DevToolsPanel, { api: api.value }) : null
  },
})

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('BasicForm')
const loading = ref(false)
const sceneConfig = ref<SceneConfig | null>(null)
const currentAdapter = shallowRef<UIAdapter | null>(null)

registerComponent('ColorPicker', ColorPicker, {
  defaultDecorator: 'FormItem',
  readPrettyComponent: PreviewColorPicker,
})
registerComponent('CronEditor', CronEditor, {
  defaultDecorator: 'FormItem',
})
registerComponent('CodeEditor', CodeEditor)
registerComponent('SignaturePad', SignaturePad)

const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

const sceneGroups = getSceneGroups()
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/** 切换 UI 库：加载适配器 → 注册组件 → 更新引用 */
async function switchUI(lib: UILib): Promise<void> {
  const adapter = await adapters[lib]()
  adapter.setup()
  currentAdapter.value = adapter
}
switchUI(currentUI.value)
watch(currentUI, switchUI)

/** 加载场景配置（切换场景时先清空，确保 ConfigForm 完全重建） */
async function loadScene(name: string): Promise<void> {
  const entry = sceneRegistry[name]
  if (!entry) {
    sceneConfig.value = null
    return
  }
  sceneConfig.value = null
  loading.value = true
  try {
    sceneConfig.value = (await entry.loader()).default
  }
  catch (e) {
    console.error(`加载场景 ${name} 失败:`, e)
    sceneConfig.value = null
  }
  finally {
    loading.value = false
  }
}
watch(currentDemo, name => loadScene(name), { immediate: true })

const i18nRuntime = shallowRef<ReturnType<typeof createVueMessageI18nRuntime> | undefined>(undefined)
const ioRuntime = shallowRef<ReturnType<typeof createVueFormIORuntime> | undefined>(undefined)
const ioMessage = ref('')
const exportJsonPreview = ref('')
const exportCsvPreview = ref('')
const importStrategy = ref<'merge' | 'shallow' | 'replace'>('merge')
const importPreview = ref<{
  type: 'JSON' | 'CSV'
  raw: string
  data: Record<string, unknown>
  appliedKeys: string[]
  skippedKeys: string[]
} | null>(null)
const jsonFileInput = ref<HTMLInputElement | null>(null)
const csvFileInput = ref<HTMLInputElement | null>(null)
watch(() => sceneConfig.value?.i18n, (config) => {
  if (!config) {
    i18nRuntime.value = undefined
    return
  }
  const messages = Object.fromEntries(
    Object.entries(config.messages).map(([localeKey, values]) => [localeKey, { ...values }]),
  )
  i18nRuntime.value = createVueMessageI18nRuntime({
    messages,
    locale: config.defaultLocale,
  })
}, { immediate: true })
watch(() => currentDemo.value === 'PrintExportForm', (enabled) => {
  ioMessage.value = ''
  importPreview.value = null
  importStrategy.value = 'merge'
  if (!enabled) {
    ioRuntime.value = undefined
    return
  }
  ioRuntime.value = createVueFormIORuntime({
    filenameBase: 'print-export',
    print: {
      title: '打印预览 - PrintExportForm',
    },
  })
}, { immediate: true })
watch(ioRuntime, (runtime, _prev, onCleanup) => {
  if (!runtime) {
    exportJsonPreview.value = ''
    exportCsvPreview.value = ''
    return
  }
  const dispose = runtime.subscribeExportPreview((preview) => {
    exportJsonPreview.value = preview.json
    exportCsvPreview.value = preview.csv
  })
  onCleanup(() => {
    dispose()
  })
}, { immediate: true })
const locale = ref('')
watch(i18nRuntime, (runtime, _prev, onCleanup) => {
  if (!runtime) {
    locale.value = ''
    return
  }
  locale.value = runtime.getLocale()
  const dispose = runtime.subscribeLocale((nextLocale) => {
    locale.value = nextLocale
  })
  onCleanup(() => {
    dispose()
  })
}, { immediate: true })

const localeOptions = computed(() => {
  const config = sceneConfig.value
  if (!config?.i18n)
    return []
  if (config.localeOptions && config.localeOptions.length > 0)
    return config.localeOptions
  return Object.keys(config.i18n.messages).map(key => ({ label: key, value: key }))
})

function translateText(value: string): string {
  const runtime = i18nRuntime.value
  if (!runtime)
    return value
  if (!value.startsWith('$t:'))
    return value
  return runtime.t(value.slice(3))
}

const sceneTitle = computed(() => {
  const config = sceneConfig.value
  if (!config)
    return ''
  void locale.value
  return translateText(config.title)
})

const sceneDescription = computed(() => {
  const config = sceneConfig.value
  if (!config)
    return ''
  void locale.value
  return translateText(config.description)
})

const scenePlugins = computed<FormPlugin[]>(() => {
  const plugins: FormPlugin[] = []
  if (i18nRuntime.value)
    plugins.push(i18nRuntime.value.plugin)
  if (ioRuntime.value)
    plugins.push(ioRuntime.value.plugin)
  return plugins
})

function switchLocale(value: string): void {
  i18nRuntime.value?.setLocale(value)
}

function showImportDone(type: 'JSON' | 'CSV', count: number): void {
  ioMessage.value = `${type} 导入成功：已更新 ${count} 个字段`
}

function showImportError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  ioMessage.value = `导入失败：${message}`
}

function exportJson(): void {
  ioRuntime.value?.downloadJSON({ filename: 'order-export.json' }).catch(showImportError)
}

function exportCsv(): void {
  ioRuntime.value?.downloadCSV({ filename: 'order-export.csv' }).catch(showImportError)
}

function printForm(): void {
  ioRuntime.value?.print().catch(showImportError)
}

function openJsonImport(): void {
  jsonFileInput.value?.click()
}

function openCsvImport(): void {
  csvFileInput.value?.click()
}

async function onJsonFileChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file || !ioRuntime.value)
    return
  try {
    const [raw, result] = await Promise.all([
      file.text(),
      ioRuntime.value.parseImportJSONFile(file, { strategy: importStrategy.value }),
    ])
    importPreview.value = {
      type: 'JSON',
      raw,
      data: result.data,
      appliedKeys: result.appliedKeys,
      skippedKeys: result.skippedKeys,
    }
    ioMessage.value = `JSON 解析完成：可导入 ${result.appliedKeys.length} 个字段`
  }
  catch (error) {
    showImportError(error)
  }
}

async function onCsvFileChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file || !ioRuntime.value)
    return
  try {
    const [raw, result] = await Promise.all([
      file.text(),
      ioRuntime.value.parseImportCSVFile(file, { strategy: importStrategy.value }),
    ])
    importPreview.value = {
      type: 'CSV',
      raw,
      data: result.data,
      appliedKeys: result.appliedKeys,
      skippedKeys: result.skippedKeys,
    }
    ioMessage.value = `CSV 解析完成：可导入 ${result.appliedKeys.length} 个字段`
  }
  catch (error) {
    showImportError(error)
  }
}

function applyImportPreview(): void {
  if (!ioRuntime.value || !importPreview.value)
    return
  try {
    const result = ioRuntime.value.applyImport(importPreview.value.data, { strategy: importStrategy.value })
    showImportDone(importPreview.value.type, result.appliedKeys.length)
    importPreview.value = null
  }
  catch (error) {
    showImportError(error)
  }
}

function clearImportPreview(): void {
  importPreview.value = null
}

function navBtnStyle(name: string): Record<string, string> {
  const active = currentDemo.value === name
  const color = currentUI.value === 'antd-vue' ? '#1677ff' : '#409eff'
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '3px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    background: active ? color : 'transparent',
    color: active ? '#fff' : '#333',
    fontWeight: active ? '600' : '400',
    marginBottom: '1px',
  }
}
</script>
