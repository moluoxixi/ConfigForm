<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center">
      <button type="button" :disabled="!canUndo || mode !== 'editable'" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="undo">
        ↩ 撤销 (Ctrl+Z)
      </button>
      <button type="button" :disabled="!canRedo || mode !== 'editable'" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="redo">
        ↪ 重做 (Ctrl+Shift+Z)
      </button>
      <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f4f4f5; color: #909399; border: 1px solid #e9e9eb">历史：{{ historyIdx + 1 }} / {{ historyLen }}</span>
    </div>
    <FormProvider :form="form">
        <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input v-if="n === 'amount'" type="number" :value="(field.value as number)" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
            <textarea v-else-if="n === 'note'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" rows="3" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
            <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <strong>提交结果</strong>
      <div style="margin-top: 4px; white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const FIELDS = ['title', 'category', 'amount', 'note']
const form = useCreateForm({ initialValues: { title: '', category: '', amount: 0, note: '' } })
const history = ref<Array<Record<string, unknown>>>([{ title: '', category: '', amount: 0, note: '' }])
const historyIdx = ref(0)
let isRestoring = false
const historyLen = computed(() => history.value.length)
const canUndo = computed(() => historyIdx.value > 0)
const canRedo = computed(() => historyIdx.value < history.value.length - 1)

onMounted(() => {
  FIELDS.forEach(n => form.createField({ name: n, label: n === 'title' ? '标题' : n === 'category' ? '分类' : n === 'amount' ? '金额' : '备注', required: n === 'title' }))
  form.onValuesChange((v: Record<string, unknown>) => {
    if (isRestoring)
      return
    history.value = history.value.slice(0, historyIdx.value + 1)
    history.value.push({ ...v })
    if (history.value.length > 50)
      history.value.shift()
    historyIdx.value = history.value.length - 1
  })
})
function undo(): void {
  if (historyIdx.value <= 0)
    return
  historyIdx.value--
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}
function redo(): void {
  if (historyIdx.value >= history.value.length - 1)
    return
  historyIdx.value++
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}
function onKeyDown(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
    e.preventDefault()
    redo()
  }
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>
