<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ASpace style="margin-bottom: 16px">
          <AButton :disabled="!canUndo || mode !== 'editable'" @click="undo">
            撤销 (Ctrl+Z)
          </AButton><AButton :disabled="!canRedo || mode !== 'editable'" @click="redo">
            重做 (Ctrl+Shift+Z)
          </AButton><ATag>历史：{{ historyIdx + 1 }} / {{ historyLen }}</ATag>
        </ASpace>
        <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
          <AFormItem :label="field.label">
            <template v-if="mode === 'readOnly'">
              <span v-if="n === 'note'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ field.value ?? '—' }}</span>
            </template>
            <template v-else>
              <AInputNumber v-if="n === 'amount'" :value="(field.value as number)" :disabled="mode === 'disabled'" style="width: 100%" @update:value="field.setValue($event)" />
              <ATextarea v-else-if="n === 'note'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :rows="3" @update:value="field.setValue($event)" />
              <AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
            </template>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Space as ASpace, Tag as ATag, Textarea as ATextarea } from 'ant-design-vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
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
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
