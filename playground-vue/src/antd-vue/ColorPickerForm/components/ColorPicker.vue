<template>
  <!-- 只读态：色块 + HEX 值 -->
  <div v-if="props.readonly" style="display: flex; gap: 8px; align-items: center">
    <div :style="{ width: '32px', height: '32px', background: props.modelValue || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" />
    <code>{{ props.modelValue }}</code>
  </div>

  <!-- 编辑态 / 禁用态 -->
  <div v-else>
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px">
      <input
        type="color"
        :value="props.modelValue ?? '#000'"
        :disabled="props.disabled"
        style="width: 48px; height: 48px; border: none; cursor: pointer; padding: 0"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <input
        type="text"
        :value="props.modelValue ?? ''"
        :disabled="props.disabled"
        style="width: 120px; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; outline: none"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <div :style="{ width: '32px', height: '32px', background: props.modelValue || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" />
    </div>
    <!-- 预设色板 -->
    <div v-if="props.presets?.length" style="display: flex; gap: 4px">
      <div
        v-for="c in props.presets" :key="c"
        :style="{
          width: '24px',
          height: '24px',
          background: c,
          borderRadius: '4px',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          border: props.modelValue === c ? '2px solid #333' : '1px solid #d9d9d9',
        }"
        @click="!props.disabled && emit('update:modelValue', c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 自定义颜色选择器组件
 *
 * 遵循 ConfigForm 组件契约：
 * - modelValue / update:modelValue 实现双向绑定
 * - disabled / readonly 控制交互状态
 * - 通过 componentProps.presets 接收预设色板
 */
const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
  readonly?: boolean
  presets?: string[]
}>(), {
  modelValue: '',
  disabled: false,
  readonly: false,
  presets: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
