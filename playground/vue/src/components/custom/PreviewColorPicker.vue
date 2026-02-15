<template>
  <span :style="wrapperStyle">
    <span :style="swatchStyle" />
    <span :style="textStyle">{{ displayValue }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const displayValue = computed(() => (props.modelValue && props.modelValue.length > 0 ? props.modelValue : '—'))
const swatchColor = computed(() => {
  const value = props.modelValue ?? ''
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'
})

const wrapperStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
} as const

const swatchStyle = computed(() => ({
  width: '16px',
  height: '16px',
  borderRadius: '3px',
  background: swatchColor.value,
  border: '1px solid #d9d9d9',
  display: 'inline-block',
}))

const textStyle = {
  fontFamily: 'monospace',
  fontSize: '13px',
} as const
</script>
