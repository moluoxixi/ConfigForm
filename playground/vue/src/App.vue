<template>
  <div style="max-width: 1400px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">ConfigForm - Vue Playground</h1>
    <p style="color: #666; margin-bottom: 16px; font-size: 13px;">
      基于 @vue/reactivity 的响应式配置化表单 · {{ totalScenes }} 个场景 × 2 套 UI 库 · ConfigForm + SchemaField 递归渲染
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 8px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333; font-size: 13px;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs" :key="lib.key"
        :style="{ padding: '4px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  background: currentUI === lib.key ? lib.color : '#fff', color: currentUI === lib.key ? '#fff' : '#333',
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
            <div style="font-size: 11px; font-weight: 600; color: #999; padding: 2px 4px;">{{ group.label }}</div>
            <button v-for="name in group.items" :key="name" :style="navBtnStyle(name)" @click="currentDemo = name">
              {{ name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; min-height: 400px;">
        <SceneRenderer v-if="sceneConfig" :config="sceneConfig" />
        <div v-else style="text-align: center; color: #999; padding: 40px;">{{ loading ? '加载中...' : '请选择场景' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SceneConfig } from '@playground/shared'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ref, watch } from 'vue'
import SceneRenderer from './components/SceneRenderer.vue'

type UILib = 'antd-vue' | 'element-plus'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('BasicForm')
const loading = ref(false)
const sceneConfig = ref<SceneConfig | null>(null)

const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

const sceneGroups = getSceneGroups()
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/** 根据 UI 库调用 setup（覆盖全局注册表） */
function applyUISetup(lib: UILib): void {
  if (lib === 'antd-vue') setupAntdVue()
  else setupElementPlus()
}
applyUISetup(currentUI.value)

watch(currentUI, (lib) => applyUISetup(lib))

/** 加载场景配置 */
async function loadScene(name: string): Promise<void> {
  const entry = sceneRegistry[name]
  if (!entry) { sceneConfig.value = null; return }
  loading.value = true
  try { sceneConfig.value = (await entry.loader()).default }
  catch (e) { console.error(`加载场景 ${name} 失败:`, e); sceneConfig.value = null }
  finally { loading.value = false }
}
watch(currentDemo, (name) => loadScene(name), { immediate: true })

function navBtnStyle(name: string): Record<string, string> {
  const active = currentDemo.value === name
  const color = currentUI.value === 'antd-vue' ? '#1677ff' : '#409eff'
  return {
    display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
    background: active ? color : 'transparent', color: active ? '#fff' : '#333',
    fontWeight: active ? '600' : '400', marginBottom: '1px',
  }
}
</script>
