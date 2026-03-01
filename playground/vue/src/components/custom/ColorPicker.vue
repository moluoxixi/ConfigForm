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

const props = defineProps<{
  modelValue?: string
  presets?: string[]
  disabled?: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const hexPattern = /^#[0-9a-f]{6}$/i
const isHexColor = (next: string): boolean => hexPattern.test(next)

const textDraft = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (value) => {
    const next = value ?? ''
    if (next !== textDraft.value) {
      textDraft.value = next
    }
  },
)

const presets = computed(() => props.presets ?? [])
const disabled = computed(() => Boolean(props.disabled || props.preview))
const colorValue = computed(() => {
  const current = props.modelValue ?? ''
  return isHexColor(current) ? current : '#000000'
})
const textValue = computed(() => textDraft.value)

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
  cursor: disabled.value ? 'not-allowed' : 'pointer',
  padding: '2px',
} as const))

const textInputStyle = computed(() => ({
  width: '90px',
  height: '32px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  padding: '0 8px',
  fontFamily: 'monospace',
  fontSize: '13px',
} as const))

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
} as const))

function presetButtonStyle(color: string) {
  return {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: props.modelValue === color ? '2px solid #1677ff' : '1px solid #d9d9d9',
    background: color,
    cursor: disabled.value ? 'not-allowed' : 'pointer',
    padding: 0,
  } as const
}

function onColorInput(event: Event): void {
  if (disabled.value)
    return
  const target = event.target as HTMLInputElement | null
  const nextValue = target?.value ?? ''
  emit('update:modelValue', nextValue)
}

function onTextInput(event: Event): void {
  if (disabled.value)
    return
  const target = event.target as HTMLInputElement | null
  const nextValue = target?.value ?? ''
  textDraft.value = nextValue
  if (isHexColor(nextValue)) {
    emit('update:modelValue', nextValue)
  }
}

function onTextBlur(): void {
  if (isHexColor(textDraft.value))
    return
  textDraft.value = props.modelValue ?? ''
}

function onPresetClick(color: string): void {
  if (!disabled.value) {
    emit('update:modelValue', color)
  }
}
</script>
