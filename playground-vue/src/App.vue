<template>
  <div style="max-width: 1100px; margin: 0 auto; padding: 24px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">
      ConfigForm - Vue Playground
    </h1>
    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
      基于 @vue/reactivity 的响应式配置化表单 · 14 个场景 × 2 套 UI 库
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; padding: 12px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333;">UI 组件库：</span>
      <button
        :style="{
          padding: '6px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          background: currentUI === 'antd-vue' ? '#1677ff' : '#fff',
          color: currentUI === 'antd-vue' ? '#fff' : '#333',
          border: `2px solid ${currentUI === 'antd-vue' ? '#1677ff' : '#ddd'}`,
        }"
        @click="switchUI('antd-vue')"
      >
        🐜 Ant Design Vue
      </button>
      <button
        :style="{
          padding: '6px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          background: currentUI === 'element-plus' ? '#409eff' : '#fff',
          color: currentUI === 'element-plus' ? '#fff' : '#333',
          border: `2px solid ${currentUI === 'element-plus' ? '#409eff' : '#ddd'}`,
        }"
        @click="switchUI('element-plus')"
      >
        🧊 Element Plus
      </button>
    </div>

    <!-- 场景导航 -->
    <div v-for="group in demoGroups" :key="group.title" style="margin-bottom: 12px;">
      <div style="font-size: 13px; font-weight: 600; color: #666; margin-bottom: 6px;">
        {{ group.title }}
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button
          v-for="item in group.items" :key="item.key" :style="{
            padding: '6px 14px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            background: currentDemo === item.key ? (currentUI === 'antd-vue' ? '#1677ff' : '#409eff') : '#fff',
            color: currentDemo === item.key ? '#fff' : '#333',
            fontWeight: currentDemo === item.key ? 600 : 400,
            borderColor: currentDemo === item.key ? (currentUI === 'antd-vue' ? '#1677ff' : '#409eff') : '#ddd',
          }"
          @click="currentDemo = item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div style="border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; margin-top: 12px;">
      <component :is="currentComponent" v-if="currentComponent" :key="`${currentUI}-${currentDemo}`" />
      <div v-else style="text-align: center; color: #999; padding: 40px;">
        加载中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

type UILib = 'antd-vue' | 'element-plus'
type DemoName
  = | 'basic' | 'linkage' | 'validation' | 'datasource' | 'array' | 'step' | 'dynamic-schema'
    | 'custom-field' | 'field-linkage' | 'array-field' | 'data-process' | 'lifecycle' | 'multi-form' | 'preview-mode'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref<DemoName>('basic')

const demoGroups = [
  {
    title: '📋 纯配置模式（Schema 驱动）',
    items: [
      { key: 'basic' as DemoName, label: '基础表单' },
      { key: 'linkage' as DemoName, label: '字段联动' },
      { key: 'validation' as DemoName, label: '全场景验证' },
      { key: 'datasource' as DemoName, label: '数据源/异步' },
      { key: 'array' as DemoName, label: '数组/表格字段' },
      { key: 'step' as DemoName, label: '分步表单+布局' },
      { key: 'dynamic-schema' as DemoName, label: '动态Schema' },
    ],
  },
  {
    title: '🧩 Field 组件模式（自定义渲染）',
    items: [
      { key: 'custom-field' as DemoName, label: '自定义组件' },
      { key: 'field-linkage' as DemoName, label: '级联联动' },
      { key: 'array-field' as DemoName, label: '可编辑表格' },
      { key: 'data-process' as DemoName, label: '数据处理' },
      { key: 'lifecycle' as DemoName, label: '生命周期/事件' },
      { key: 'multi-form' as DemoName, label: '多表单协作' },
      { key: 'preview-mode' as DemoName, label: '模式切换' },
    ],
  },
]

/** 文件名映射 */
const fileMap: Record<DemoName, { config: string, field: string }> = {
  'basic': { config: 'BasicForm', field: '' },
  'linkage': { config: 'LinkageForm', field: '' },
  'validation': { config: 'ValidationForm', field: '' },
  'datasource': { config: 'DataSourceForm', field: '' },
  'array': { config: 'ArrayForm', field: '' },
  'step': { config: 'StepForm', field: '' },
  'dynamic-schema': { config: 'DynamicSchemaForm', field: '' },
  'custom-field': { config: '', field: 'CustomFieldForm' },
  'field-linkage': { config: '', field: 'FieldLinkageForm' },
  'array-field': { config: '', field: 'ArrayFieldForm' },
  'data-process': { config: '', field: 'DataProcessForm' },
  'lifecycle': { config: '', field: 'LifecycleForm' },
  'multi-form': { config: '', field: 'MultiFormForm' },
  'preview-mode': { config: '', field: 'PreviewModeForm' },
}

/** 动态导入组件 */
const asyncComponents: Record<string, Record<string, ReturnType<typeof defineAsyncComponent>>> = {
  'antd-vue': {},
  'element-plus': {},
}

/* 注册 antd-vue 所有异步组件 */
const antdConfigModules = import.meta.glob('./antd-vue/config/*.vue')
const antdFieldModules = import.meta.glob('./antd-vue/field/*.vue')
for (const [path, loader] of Object.entries(antdConfigModules)) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  asyncComponents['antd-vue'][name] = defineAsyncComponent(loader as () => Promise<any>)
}
for (const [path, loader] of Object.entries(antdFieldModules)) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  asyncComponents['antd-vue'][name] = defineAsyncComponent(loader as () => Promise<any>)
}

/* 注册 element-plus 所有异步组件 */
const elConfigModules = import.meta.glob('./element-plus/config/*.vue')
const elFieldModules = import.meta.glob('./element-plus/field/*.vue')
for (const [path, loader] of Object.entries(elConfigModules)) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  asyncComponents['element-plus'][name] = defineAsyncComponent(loader as () => Promise<any>)
}
for (const [path, loader] of Object.entries(elFieldModules)) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  asyncComponents['element-plus'][name] = defineAsyncComponent(loader as () => Promise<any>)
}

/** 当前组件 */
const currentComponent = computed(() => {
  const map = fileMap[currentDemo.value]
  const fileName = map.config || map.field
  return asyncComponents[currentUI.value]?.[fileName]
})

function switchUI(lib: UILib): void {
  currentUI.value = lib
  currentDemo.value = 'basic'
}
</script>
