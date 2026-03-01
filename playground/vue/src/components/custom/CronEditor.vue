<template>
  <div :style="wrapperStyle">
    <input
      type="text"
      :value="inputValue"
      :disabled="disabled"
      :readonly="disabled"
      placeholder="* * * * *"
      :style="inputStyle"
      @input="onInput"
    >

    <div :style="partsStyle">
      <div v-for="(label, index) in cronLabels" :key="label" :style="partStyle">
        <input
          type="text"
          :value="parts[index]"
          :disabled="disabled"
          :readonly="disabled"
          placeholder="*"
          :style="partInputStyle"
          @input="onPartInput(index, $event)"
        >
        <div :style="partLabelStyle">
          {{ label }}
        </div>
      </div>
    </div>

    <div :style="descStyle">
      解读：{{ description }}
    </div>

    <div v-if="presets.length" :style="presetsStyle">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        :disabled="disabled"
        :style="presetButtonStyle(preset.value)"
        @click="onPresetClick(preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CronPreset {
  label: string
  value: string
}

const props = defineProps<{
  modelValue?: string
  presets?: CronPreset[]
  disabled?: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const cronLabels = ['分', '时', '日', '月', '周']

const inputValue = computed(() => props.modelValue ?? '')
const disabled = computed(() => Boolean(props.disabled || props.preview))
const presets = computed(() => props.presets ?? [])

function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return cronLabels.map((_, index) => pieces[index] ?? '*')
}

const parts = computed(() => normalizeParts(inputValue.value))

const description = computed(() => {
  const trimmed = inputValue.value.trim()
  return trimmed.length > 0 ? trimmed : '—'
})

const wrapperStyle = {
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  padding: '12px',
} as const

const inputStyle = computed(() => ({
  width: '100%',
  padding: '6px 12px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  marginBottom: '8px',
  background: disabled.value ? '#f5f5f5' : '#fff',
} as const))

const partsStyle = {
  display: 'flex',
  gap: '4px',
  marginBottom: '8px',
} as const

const partStyle = {
  flex: 1,
  textAlign: 'center',
} as const

const partInputStyle = computed(() => ({
  width: '100%',
  padding: '4px 6px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
  textAlign: 'center',
  background: disabled.value ? '#f5f5f5' : '#fff',
} as const))

const partLabelStyle = {
  fontSize: '11px',
  color: '#666',
  marginTop: '2px',
} as const

const descStyle = {
  fontSize: '12px',
  color: '#1677ff',
  marginBottom: '8px',
} as const

const presetsStyle = {
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
} as const

function presetButtonStyle(value: string) {
  const active = inputValue.value === value
  return {
    padding: '2px 8px',
    fontSize: '11px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    background: active ? '#e6f4ff' : '#fff',
    color: active ? '#1677ff' : '#333',
    cursor: disabled.value ? 'not-allowed' : 'pointer',
  } as const
}

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

function onPartInput(index: number, event: Event): void {
  const target = event.target as HTMLInputElement | null
  const nextParts = normalizeParts(inputValue.value)
  const next = (target?.value ?? '').trim()
  nextParts[index] = next.length > 0 ? next : '*'
  emit('update:modelValue', nextParts.join(' '))
}

/**
 * on Preset Click：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/components/custom/CronEditor.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {string} value 参数 `value`用于提供待处理的值并参与结果计算。
 */
function onPresetClick(value: string): void {
  if (!disabled.value) {
    emit('update:modelValue', value)
  }
}
</script>
