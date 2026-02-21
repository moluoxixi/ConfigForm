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
import type { CSSProperties } from 'vue'
import { computed } from 'vue'

interface CronPreset {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  presets?: CronPreset[]
  disabled?: boolean
}>(), {
  presets: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const cronLabels = ['分', '时', '日', '月', '周']

const inputValue = computed(() => props.modelValue ?? '')

/**
 * normalize Parts：负责“规范化normalize Parts”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Parts 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return cronLabels.map((_, index) => pieces[index] ?? '*')
}

const parts = computed(() => normalizeParts(inputValue.value))

/**
 * describe Cron：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 describe Cron 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function describeCron(expr: string): string {
  const rawPieces = expr.trim().split(/\s+/).filter(Boolean)
  if (rawPieces.length < 5)
    return '格式错误（需要 5 段）'

  const [min, hour, day, month, weekday] = normalizeParts(expr)
  const desc: string[] = []

  if (weekday !== '*')
    desc.push(`周${weekday}`)
  if (month !== '*')
    desc.push(`${month}月`)
  if (day !== '*')
    desc.push(`${day}日`)
  if (hour !== '*')
    desc.push(`${hour}时`)
  if (min !== '*')
    desc.push(`${min}分`)
  if (min === '*' && hour === '*')
    desc.push('每分钟')
  else if (min === '0' && hour === '*')
    desc.push('每整点')

  return desc.join(' ') || '每分钟'
}

const description = computed(() => describeCron(inputValue.value))

const wrapperStyle = {
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  padding: '12px',
} as const

const inputStyle = computed<CSSProperties>(() => ({
  width: '100%',
  padding: '6px 12px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  marginBottom: '8px',
  background: props.disabled ? '#f5f5f5' : '#fff',
  cursor: props.disabled ? 'not-allowed' : 'text',
}))

const partsStyle = {
  display: 'flex',
  gap: '4px',
  marginBottom: '8px',
} as const

const partStyle = {
  flex: 1,
  textAlign: 'center',
} as const

const partInputStyle = computed<CSSProperties>(() => ({
  width: '100%',
  padding: '4px 6px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
  textAlign: 'center',
  background: props.disabled ? '#f5f5f5' : '#fff',
}))

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

/**
 * preset Button Style：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 preset Button Style 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function presetButtonStyle(value: string): Record<string, string> {
  const active = props.modelValue === value
  return {
    padding: '2px 8px',
    fontSize: '11px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    background: active ? '#e6f4ff' : '#fff',
    color: active ? '#1677ff' : '#333',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
  }
}

/**
 * on Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

/**
 * on Part Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Part Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onPartInput(index: number, event: Event): void {
  const target = event.target as HTMLInputElement | null
  const nextParts = normalizeParts(inputValue.value)
  const next = (target?.value ?? '').trim()
  nextParts[index] = next.length > 0 ? next : '*'
  emit('update:modelValue', nextParts.join(' '))
}

/**
 * on Preset Click：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 on Preset Click 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function onPresetClick(value: string): void {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
}
</script>
