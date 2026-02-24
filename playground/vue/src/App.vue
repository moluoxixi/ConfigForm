<template>
  <div style="width: 100vw; margin: 0; padding: 16px; font-family: system-ui, sans-serif; height: 100vh; min-height: 0; min-width: 0; flex: 1 1 auto; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
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
    <div style="display: flex; gap: 16px; min-width: 0; flex: 1; min-height: 0; overflow: hidden;">
      <!-- 左侧导航 -->
      <div style="width: 280px; flex-shrink: 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; min-height: 0;">
        <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 8px;">
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
      <div style="flex: 1; min-width: 0; min-height: 0; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden;">
        <SceneRenderer
          v-if="sceneConfig && currentAdapter"
          :key="`${currentDemo}-${currentUI}`"
          :config="sceneConfig"
          :title="sceneTitle"
          :description="sceneDescription"
          :extra-plugins="scenePlugins"
          :status-tabs="currentAdapter.StatusTabs"
          style="flex: 1; min-height: 0; display: flex; flex-direction: column;"
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
          </template>
        </SceneRenderer>
        <div v-else style="flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; text-align: center; color: #999; padding: 40px;">
          {{ loading ? '加载中...' : '请选择场景' }}
        </div>
      </div>
    </div>

    <!-- DevTools 浮动面板 -->
    <DevToolsFloating />
  </div>
</template>

<script setup lang="ts">
import type { FormPlugin } from '@moluoxixi/core'
import type { DevToolsPluginAPI } from '@moluoxixi/plugin-devtools'
import type { SceneConfig } from '@playground/shared'
import type { UIAdapter, UILib } from './ui'
import { DevToolsPanel } from '@moluoxixi/plugin-devtools-vue'
import { setupLowerCodeDesigner } from '@moluoxixi/plugin-lower-code-vue'
import { registerComponent } from '@moluoxixi/vue'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import { computed, defineComponent, h, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { CodeEditor, ColorPicker, CronEditor, PreviewColorPicker, SignaturePad } from './components/custom'
import SceneRenderer from './components/SceneRenderer.vue'
import { useI18nFeature } from './examples/11-misc/useI18nFeature'
import { usePrintExportFeature } from './examples/11-misc/usePrintExportFeature'
import { adapters } from './ui'

/**
 * Hook Type：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface HookType {
  forms: Map<string, DevToolsPluginAPI>
  register: (id: string, api: DevToolsPluginAPI) => void
  unregister: (id: string) => void
  onChange: (fn: (forms: Map<string, DevToolsPluginAPI>) => void) => () => void
}

/**
 * get Or Create Hook：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/App.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns {HookType} 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function getOrCreateHook(): HookType {
  const g = window as unknown as Record<string, unknown>
  if (!g.__CONFIGFORM_DEVTOOLS_HOOK__) {
    const listeners = new Set<(forms: Map<string, DevToolsPluginAPI>) => void>()
    const hook = {
      forms: new Map<string, DevToolsPluginAPI>(),
      /**
       * register：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/vue/src/App.vue`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param {string} id 参数 `id`用于提供唯一标识，确保操作可以精确命中对象。
       * @param {DevToolsPluginAPI} api 参数 `api`用于提供当前函数执行所需的输入信息。
       */
      register(id: string, api: DevToolsPluginAPI) {
        hook.forms.set(id, api)
        listeners.forEach(fn => fn(hook.forms))
      },
      /**
       * unregister：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/vue/src/App.vue`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param {string} id 参数 `id`用于提供唯一标识，确保操作可以精确命中对象。
       */
      unregister(id: string) {
        hook.forms.delete(id)
        listeners.forEach(fn => fn(hook.forms))
      },
      /**
       * on Change：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/vue/src/App.vue`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param {(forms: Map<string, DevToolsPluginAPI>) => void} fn 参数 `fn`用于提供当前函数执行所需的输入信息。
       * @returns {unknown} 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
       */
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
  /**
   * setup：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`playground/vue/src/App.vue`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @returns {unknown} 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup() {
    const api = shallowRef<DevToolsPluginAPI | null>(null)
    let dispose: (() => void) | null = null

    onMounted(() => {
      const hook = getOrCreateHook()
      /**
       * update：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/vue/src/App.vue`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param {Map<string, DevToolsPluginAPI>} forms 参数 `forms`用于提供表单上下文或实例，支撑状态读写与生命周期调用。
       */
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

/**
 * current UI：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const currentUI = ref<UILib>('antd-vue')
/**
 * current Demo：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const currentDemo = ref('BasicForm')
/**
 * loading：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const loading = ref(false)
/**
 * scene Config：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const sceneConfig = ref<SceneConfig | null>(null)
/**
 * current Adapter：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
setupLowerCodeDesigner()

/**
 * ui Libs：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

/**
 * scene Groups：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const sceneGroups = getSceneGroups()
/**
 * total Scenes：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/**
 * 切换 UI 库：加载适配器 → 注册组件 → 更新引用
 * @param {UILib} lib 参数 `lib`用于提供当前函数执行所需的输入信息。
 */
async function switchUI(lib: UILib): Promise<void> {
  const adapter = await adapters[lib]()
  adapter.setup()
  currentAdapter.value = adapter
}
switchUI(currentUI.value)
watch(currentUI, switchUI)

/**
 * 加载场景配置（切换场景时先清空，确保 ConfigForm 完全重建）
 * @param {string} name 参数 `name`用于提供当前函数执行所需的输入信息。
 */
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
  catch (error) {
    console.error(`加载场景 ${name} 失败:`, error)
    sceneConfig.value = null
  }
  finally {
    loading.value = false
  }
}

watch(currentDemo, (name) => {
  void loadScene(name)
}, { immediate: true })

/**
 * i18n Feature：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const i18nFeature = useI18nFeature(sceneConfig)
/**
 * print Export Feature：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const printExportFeature = usePrintExportFeature(currentDemo)

/**
 * scene Plugins：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const scenePlugins = computed<FormPlugin[]>(() => {
  const plugins: FormPlugin[] = []
  const i18nPlugin = i18nFeature.plugin.value
  if (i18nPlugin)
    plugins.push(i18nPlugin)
  if (printExportFeature.plugins.value.length)
    plugins.push(...printExportFeature.plugins.value)
  return plugins
})

/**
 * scene Title：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const sceneTitle = computed(() => i18nFeature.sceneTitle.value || sceneConfig.value?.title || '')
/**
 * scene Description：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const sceneDescription = computed(() => i18nFeature.sceneDescription.value || sceneConfig.value?.description || '')
/**
 * i18n Runtime：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const i18nRuntime = computed(() => i18nFeature.i18nRuntime.value)
/**
 * locale Options：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const localeOptions = computed(() => i18nFeature.localeOptions.value)
/**
 * locale：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/App.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const locale = computed(() => i18nFeature.locale.value)

/**
 * switch Locale：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/App.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {string} value 参数 `value`用于提供待处理的值并参与结果计算。
 */
function switchLocale(value: string): void {
  i18nFeature.switchLocale(value)
}

/**
 * nav Btn Style：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/App.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {string} name 参数 `name`用于提供当前函数执行所需的输入信息。
 * @returns {Record<string, string>} 返回对象结构，其字段布局遵循当前模块约定。
 */
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

<style>
html,
body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

#app {
  width: 100vw;
  height: 100vh;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
