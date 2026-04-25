<script setup lang="ts">
import GridForm from './demos/GridForm.vue'
import InlineForm from './demos/InlineForm.vue'
import DecoratorForm from './demos/DecoratorForm.vue'
</script>

<template>
  <div class="playground-root">
    <h1>ConfigForm + Element Plus</h1>
    <h2>🎨 装饰器语法（@Field + toFields）</h2>
    <DecoratorForm />
    <h2>Grid Mode</h2>
    <GridForm />
    <h2>Inline Mode</h2>
    <InlineForm />
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
