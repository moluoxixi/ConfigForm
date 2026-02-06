<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ASpace style="margin-bottom: 16px"><AButton :disabled="!canUndo || mode !== 'editable'" @click="undo">撤销 (Ctrl+Z)</AButton><AButton :disabled="!canRedo || mode !== 'editable'" @click="redo">重做 (Ctrl+Shift+Z)</AButton><ATag>历史：{{ historyIdx + 1 }} / {{ historyLen }}</ATag></ASpace>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label">
        <AInputNumber v-if="n === 'amount'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
        <ATextarea v-else-if="n === 'note'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="3" />
        <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" />
      </AFormItem></FormField>
      <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
    </form></FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Textarea as ATextarea, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
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
  form.onValuesChange((v: Record<string, unknown>) => { if (isRestoring) return; history.value = history.value.slice(0, historyIdx.value + 1); history.value.push({ ...v }); if (history.value.length > 50) history.value.shift(); historyIdx.value = history.value.length - 1 })
})
function undo(): void { if (historyIdx.value <= 0) return; historyIdx.value--; isRestoring = true; form.setValues(history.value[historyIdx.value]); isRestoring = false }
function redo(): void { if (historyIdx.value >= history.value.length - 1) return; historyIdx.value++; isRestoring = true; form.setValues(history.value[historyIdx.value]); isRestoring = false }
function onKeyDown(e: KeyboardEvent): void { if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }; if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo() } }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
