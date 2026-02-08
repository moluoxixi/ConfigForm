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

        <!-- 场景列表（从 glob 自动生成） -->
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
        <component :is="currentComponent" v-if="currentComponent" :key="`${currentUI}-${navMode}-${currentDemo}`" />
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          请选择场景
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

type UILib = 'antd-vue' | 'element-plus'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('BasicForm')
const navMode = ref<'config' | 'field'>('config')

const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

/** 分组目录名 → 中文标题 */
const GROUP_LABELS: Record<string, string> = {
  '01-basic': '基础场景',
  '02-linkage': '联动场景',
  '03-validation': '验证场景',
  '04-complex-data': '复杂数据',
  '05-datasource': '数据源',
  '06-layout': '布局分组',
  '07-dynamic': '动态表单',
  '08-components': '复杂组件',
  '09-state': '表单状态',
  '10-misc': '其他能力',
  '11-advanced': '扩展场景',
}

/* ======================== import.meta.glob 自动扫描 ======================== */

/**
 * 两层 glob：{ui-lib}/{group}/{demo}/config|field.vue
 * 路径示例：./antd-vue/01-basic/BasicForm/config.vue
 */
const antdConfigGlob = import.meta.glob('./antd-vue/*/*/config.vue')
const antdFieldGlob = import.meta.glob('./antd-vue/*/*/field.vue')
const epConfigGlob = import.meta.glob('./element-plus/*/*/config.vue')
const epFieldGlob = import.meta.glob('./element-plus/*/*/field.vue')

/** 从 glob 路径解析分组和示例名 */
function parseGlobPath(path: string): { group: string, name: string } | null {
  const m = path.match(/\/(\d{2}-[\w-]+)\/([\w]+)\/(config|field)\.vue$/)
  return m ? { group: m[1], name: m[2] } : null
}

/** 将 glob 结果转为 { DemoName: AsyncComponent } */
function buildComponentMap(glob: Record<string, () => Promise<unknown>>): Record<string, ReturnType<typeof defineAsyncComponent>> {
  const map: Record<string, ReturnType<typeof defineAsyncComponent>> = {}
  for (const [path, loader] of Object.entries(glob)) {
    const parsed = parseGlobPath(path)
    if (parsed) {
      map[parsed.name] = defineAsyncComponent(loader as () => Promise<any>)
    }
  }
  return map
}

/** 从任一 glob 结果自动生成分组列表 */
function buildSceneGroups(glob: Record<string, () => Promise<unknown>>): Array<{ key: string, label: string, items: string[] }> {
  const groupMap = new Map<string, Set<string>>()

  for (const path of Object.keys(glob)) {
    const parsed = parseGlobPath(path)
    if (parsed) {
      if (!groupMap.has(parsed.group)) {
        groupMap.set(parsed.group, new Set())
      }
      groupMap.get(parsed.group)!.add(parsed.name)
    }
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, names]) => ({
      key,
      label: GROUP_LABELS[key] ?? key,
      items: Array.from(names).sort(),
    }))
}

const asyncComponents: Record<UILib, Record<'config' | 'field', Record<string, ReturnType<typeof defineAsyncComponent>>>> = {
  'antd-vue': {
    config: buildComponentMap(antdConfigGlob),
    field: buildComponentMap(antdFieldGlob),
  },
  'element-plus': {
    config: buildComponentMap(epConfigGlob),
    field: buildComponentMap(epFieldGlob),
  },
}

/** 场景分组（从 glob 自动生成，无需硬编码） */
const sceneGroups = buildSceneGroups({ ...antdConfigGlob, ...antdFieldGlob })
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/** 当前组件 */
const currentComponent = computed(() => {
  return asyncComponents[currentUI.value]?.[navMode.value]?.[currentDemo.value]
})

function navBtnStyle(key: string): Record<string, string> {
  const active = currentDemo.value === key
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
