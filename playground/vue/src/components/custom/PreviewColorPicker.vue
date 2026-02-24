<template>
  <span :style="wrapperStyle">
    <span :style="swatchStyle" />
    <span :style="textStyle">{{ displayValue }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const wrapperStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
} as const

/**
 * swatch Style：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/components/custom/PreviewColorPicker.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const swatchStyle = computed(() => ({
  width: '16px',
  height: '16px',
  borderRadius: '3px',
  background: swatchColor.value,
  border: '1px solid #d9d9d9',
  display: 'inline-block',
}))

/**
 * text Style：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/components/custom/PreviewColorPicker.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const textStyle = {
  fontFamily: 'monospace',
  fontSize: '13px',
} as const
</script>
