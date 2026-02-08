<template>
  <div style="max-width: 1400px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">
      ConfigForm - Vue Playground
    </h1>
    <p style="color: #666; margin-bottom: 16px; font-size: 13px;">
      基于 @vue/reactivity 的响应式配置化表单 · {{ totalScenes }} 个场景 × 2 套 UI 库 · Config（Schema 驱动） / Field（自定义渲染）
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 8px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333; font-size: 13px;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs" :key="lib.key"
        :style="{ padding: '4px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
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
        <!-- Config / Field Tab 切换 -->
        <div style="display: flex; border-bottom: 1px solid #eee;">
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: navMode === 'config' ? '#1677ff' : '#f5f5f5', color: navMode === 'config' ? '#fff' : '#666' }"
            @click="navMode = 'config'"
          >
            Config 模式
          </button>
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: navMode === 'field' ? '#52c41a' : '#f5f5f5', color: navMode === 'field' ? '#fff' : '#666' }"
            @click="navMode = 'field'"
          >
            Field 模式
          </button>
        </div>

        <!-- 场景列表 -->
        <div style="max-height: calc(100vh - 220px); overflow: auto; padding: 8px;">
          <div v-for="group in sceneGroups" :key="group.key" style="margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #999; padding: 2px 4px;">
              {{ group.label }}
            </div>
            <button
              v-for="name in group.items" :key="name"
              :style="navBtnStyle(name)"
              @click="currentDemo = name"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; min-height: 400px;">
        <div v-if="sceneConfig" :key="`${renderKey}-${navMode}-${currentDemo}`">
          <h2>{{ sceneConfig.title }}{{ navMode === 'field' ? '（Field 版）' : '' }}</h2>
          <p :style="{ color: currentUI === 'antd-vue' ? 'rgba(0,0,0,0.45)' : '#909399', marginBottom: '16px', fontSize: '14px' }">
            {{ sceneConfig.description }}{{ navMode === 'field' ? ' — FormField + fieldProps 实现' : '' }}
          </p>

          <!-- Config 模式：通用渲染 -->
          <StatusTabs v-if="navMode === 'config'" ref="st" v-slot="{ mode, showResult }">
            <ConfigForm
              :schema="withMode(sceneConfig.schema, mode)"
              :initial-values="sceneConfig.initialValues"
              @submit="showResult"
              @submit-failed="(e: any) => st?.showErrors(e)"
            />
          </StatusTabs>

          <!-- Field 模式：通用渲染 -->
          <FieldScene
            v-else
            :fields="sceneConfig.fields"
            :initial-values="sceneConfig.initialValues"
            :label-width="(sceneConfig.schema.decoratorProps?.labelWidth as string) ?? '120px'"
          />
        </div>
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          {{ loading ? '加载中...' : '请选择场景' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@moluoxixi/playground-shared'
import { getSceneGroups, sceneRegistry } from '@moluoxixi/playground-shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'
import FieldScene from './components/FieldScene.vue'

type UILib = 'antd-vue' | 'element-plus'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('BasicForm')
const navMode = ref<'config' | 'field'>('config')
const loading = ref(false)
const sceneConfig = ref<SceneConfig | null>(null)
const st = ref<InstanceType<typeof StatusTabs>>()
/** 用于强制重新挂载内容区域 */
const renderKey = ref(0)

const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

/** 根据当前 UI 库调用对应 setup（切换时重新注册组件覆盖） */
function applyUISetup(lib: UILib): void {
  if (lib === 'antd-vue') setupAntdVue()
  else setupElementPlus()
}

applyUISetup(currentUI.value)

/** UI 库切换时重新注册 + 强制重新挂载 */
watch(currentUI, (lib) => {
  applyUISetup(lib)
  renderKey.value++
})

const sceneGroups = getSceneGroups()
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/** 加载场景配置 */
async function loadScene(name: string): Promise<void> {
  const entry = sceneRegistry[name]
  if (!entry) { sceneConfig.value = null; return }
  loading.value = true
  try {
    const mod = await entry.loader()
    sceneConfig.value = mod.default
  }
  catch (e) {
    console.error(`加载场景 ${name} 失败:`, e)
    sceneConfig.value = null
  }
  finally { loading.value = false }
}

watch(currentDemo, (name) => loadScene(name), { immediate: true })

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

function navBtnStyle(key: string): Record<string, string> {
  const active = currentDemo.value === key
  const color = currentUI.value === 'antd-vue' ? '#1677ff' : '#409eff'
  return {
    display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
    background: active ? color : 'transparent', color: active ? '#fff' : '#333',
    fontWeight: active ? '600' : '400', marginBottom: '1px',
  }
}
</script>
