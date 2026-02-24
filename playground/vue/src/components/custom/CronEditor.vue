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

/**
 * normalizeParts?????????????????
 * ???`playground/vue/src/components/custom/CronEditor.vue:5`?
 * ?????????????????????????????????
 * ??????????????????????????
 * @param expr ?? expr ????????????
 * @returns ?????????????
 */
function normalizeParts(expr: string): string[] {
  const pieces = expr.trim().split(/\s+/).filter(Boolean)
  return cronLabels.map((_, index) => pieces[index] ?? '*')
}

/**
 * onPartInput?????????????????
 * ???`playground/vue/src/components/custom/CronEditor.vue:10`?
 * ?????????????????????????????????
 * ??????????????????????????
 * @param index ?? index ????????????
 * @param event ?? event ????????????
 */
function onPartInput(index: number, event: Event): void {
  const target = event.target as HTMLInputElement | null
  const nextParts = normalizeParts(inputValue.value)
  const next = (target?.value ?? '').trim()
  nextParts[index] = next.length > 0 ? next : '*'
  emit('update:modelValue', nextParts.join(' '))
}

/**
 * on Preset Click：当前功能模块的核心执行单元。
 * 所属模块：`playground/vue/src/components/custom/CronEditor.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {string} value 参数 `value`用于提供待处理的值并参与结果计算。
 */
function onPresetClick(value: string): void {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
}
</script>
