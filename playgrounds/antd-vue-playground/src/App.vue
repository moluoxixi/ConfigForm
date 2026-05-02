<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

const GridForm = defineAsyncComponent(() => import('./demos/GridForm.vue'))
const I18nPluginForm = defineAsyncComponent(() => import('./demos/I18nPluginForm.vue'))
const InlineForm = defineAsyncComponent(() => import('./demos/InlineForm.vue'))

const activeTab = ref('grid')
</script>

<template>
  <div class="playground-root">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="grid" tab="antd Grid 模式">
        <GridForm />
      </a-tab-pane>
      <a-tab-pane key="inline" tab="antd Inline 模式">
        <InlineForm />
      </a-tab-pane>
      <a-tab-pane key="i18n" tab="antd i18n 插件">
        <I18nPluginForm />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  background: #fff;
}

.playground-root {
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #fff;
  min-height: 100vh;
}
</style>
