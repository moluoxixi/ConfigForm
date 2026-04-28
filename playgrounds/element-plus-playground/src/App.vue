<script setup lang="ts">
import { ref } from 'vue'
import GridForm from './demos/GridForm.vue'
import InlineForm from './demos/InlineForm.vue'

const activeTab = ref('grid')
</script>

<template>
  <div class="playground-root">
    <h1>ConfigForm + Element Plus</h1>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Grid 模式" name="grid">
        <GridForm />
      </el-tab-pane>
      <el-tab-pane label="Inline 模式" name="inline">
        <InlineForm />
      </el-tab-pane>
    </el-tabs>
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
