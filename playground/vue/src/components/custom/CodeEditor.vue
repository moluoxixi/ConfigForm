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
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
  preview?: boolean
  language?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const lines = computed(() => (props.modelValue ?? '').split('\n').length)

const wrapperStyle = {
  position: 'relative',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  overflow: 'hidden',
} as const

const headerStyle = {
  padding: '4px 12px',
  background: '#f5f5f5',
  borderBottom: '1px solid #d9d9d9',
  fontSize: '11px',
  color: '#999',
  fontFamily: 'monospace',
} as const

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
 * on Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement | null
  emit('update:modelValue', target?.value ?? '')
}
</script>
