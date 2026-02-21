<template>
  <div :style="wrapperStyle">
    <input
      type="color"
      :value="colorValue"
      :disabled="disabled"
      :style="colorInputStyle"
      @input="onColorInput"
    >
    <input
      type="text"
      :value="textValue"
      :disabled="disabled"
      :style="textInputStyle"
      maxlength="7"
      @input="onTextInput"
      @blur="onTextBlur"
    >
    <div v-if="presets.length" :style="presetsStyle">
      <button
        v-for="color in presets"
        :key="color"
        type="button"
        :disabled="disabled"
        :style="presetButtonStyle(color)"
        :title="color"
        @click="onPresetClick(color)"
      />
    </div>
    <span :style="previewStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  presets?: string[]
  disabled?: boolean
}>(), {
  presets: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const hexPattern = /^#[0-9a-f]{6}$/i
const isHexColor = (value: string): boolean => hexPattern.test(value)

const textDraft = ref(props.modelValue ?? '')
const textValue = computed(() => textDraft.value)
const colorValue = computed(() => {
  const value = props.modelValue ?? ''
  return isHexColor(value) ? value : '#000000'
})

watch(
  () => props.modelValue,
  (value) => {
    const next = value ?? ''
    if (next !== textDraft.value) {
      textDraft.value = next
    }
  },
)

const wrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
} as const

const colorInputStyle = computed(() => ({
  width: '40px',
  height: '32px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  padding: '2px',
}))

const textInputStyle = {
  width: '90px',
  height: '32px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  padding: '0 8px',
  fontFamily: 'monospace',
  fontSize: '13px',
} as const

const presetsStyle = {
  display: 'flex',
  gap: '4px',
} as const

const previewStyle = computed(() => ({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  background: colorValue.value,
  border: '1px solid #d9d9d9',
  display: 'inline-block',
}))

/**
 * preset Button Style：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 preset Button Style 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function presetButtonStyle(color: string): Record<string, string> {
  return {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: props.modelValue === color ? '2px solid #1677ff' : '1px solid #d9d9d9',
    background: color,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    padding: '0',
  }
}

/**
 * on Color Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Color Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onColorInput(event: Event): void {
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

/**
 * on Text Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Text Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onTextInput(event: Event): void {
  const target = event.target as HTMLInputElement | null
  const nextValue = target?.value ?? ''
  textDraft.value = nextValue
  if (isHexColor(nextValue)) {
    emit('update:modelValue', nextValue)
  }
}

/**
 * on Text Blur：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Text Blur 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onTextBlur(): void {
  if (!isHexColor(textDraft.value)) {
    textDraft.value = props.modelValue ?? ''
  }
}

/**
 * on Preset Click：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Preset Click 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onPresetClick(color: string): void {
  if (!props.disabled) {
    emit('update:modelValue', color)
  }
}
</script>
