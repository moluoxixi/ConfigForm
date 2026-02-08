<template>
  <!-- 三态切换（纯 HTML） -->
  <div style="display: inline-flex; background: #f5f5f5; border-radius: 6px; padding: 2px; margin-bottom: 16px">
    <button
      v-for="opt in MODE_OPTIONS" :key="opt.value"
      :style="{
        padding: '4px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        background: mode === opt.value ? '#fff' : 'transparent',
        boxShadow: mode === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
        fontWeight: mode === opt.value ? '600' : 'normal',
      }"
      @click="mode = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>

  <!-- 表单内容（由 config.vue / field.vue 填充） -->
  <slot :mode="mode" :show-result="showResult" />

  <!-- 结果展示 -->
  <div
    v-if="result"
    :style="{
      marginTop: '16px',
      padding: '12px 16px',
      borderRadius: '6px',
      border: `1px solid ${isError ? '#ffccc7' : '#b7eb8f'}`,
      background: isError ? '#fff2f0' : '#f6ffed',
    }"
  >
    <div :style="{ fontWeight: 600, marginBottom: '4px', color: isError ? '#ff4d4f' : '#52c41a' }">
      {{ props.resultTitle }}
    </div>
    <pre style="margin: 0; white-space: pre-wrap; font-size: 13px">{{ result }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
/**
 * Playground 通用表单包装器
 *
 * 职责：三态切换 + 结果展示。
 * 不包含 ConfigForm / FormProvider 等表单逻辑，由各场景文件自行实现。
 */
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  resultTitle?: string
}>(), {
  resultTitle: '提交结果',
})

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '阅读态', value: 'readOnly' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

const mode = ref<FieldPattern>('editable')
const result = ref('')
const isError = computed(() => result.value.startsWith('验证失败'))

/** 供场景文件调用：显示提交结果 */
function showResult(data: Record<string, unknown>): void {
  result.value = JSON.stringify(data, null, 2)
}

/** 供场景文件调用：显示验证失败 */
function showErrors(errors: Array<{ path: string, message: string }>): void {
  result.value = `验证失败:\n${errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`
}

defineExpose({ mode, result, showResult, showErrors })
</script>
