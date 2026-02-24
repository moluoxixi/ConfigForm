<template>
  <div :style="wrapperStyle">
    <div v-if="language" :style="headerStyle">
      {{ language }} · {{ lines }} 行
    </div>
    <textarea
      :value="modelValue ?? ''"
      :disabled="disabled"
      :readonly="preview"
      spellcheck="false"
      :style="textareaStyle"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
const wrapperStyle = {
  position: 'relative',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  overflow: 'hidden',
} as const

/**
 * header Style：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/components/custom/CodeEditor.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const headerStyle = {
  padding: '4px 12px',
  background: '#f5f5f5',
  borderBottom: '1px solid #d9d9d9',
  fontSize: '11px',
  color: '#999',
  fontFamily: 'monospace',
} as const

/**
 * textarea Style：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/components/custom/CodeEditor.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const textareaStyle = {
  width: '100%',
  minHeight: '200px',
  padding: '12px 16px',
  border: 'none',
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  fontSize: '13px',
  lineHeight: '1.6',
  background: '#fafafa',
  color: '#333',
  tabSize: '2',
} as const

/**
 * on Input：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/components/custom/CodeEditor.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {Event} event 参数 `event`用于传递事件上下文，使逻辑能基于交互状态进行处理。
 */
function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement | null
  emit('update:modelValue', target?.value ?? '')
}
</script>
