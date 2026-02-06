<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <el-space style="margin-bottom: 16px"><el-button :disabled="!canUndo || mode !== 'editable'" @click="undo">撤销 (Ctrl+Z)</el-button><el-button :disabled="!canRedo || mode !== 'editable'" @click="redo">重做 (Ctrl+Shift+Z)</el-button><el-tag>历史：{{ historyIdx + 1 }} / {{ historyLen }}</el-tag></el-space>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n"><el-form-item :label="field.label">
        <el-input-number v-if="n === 'amount'" :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
        <el-input v-else-if="n === 'note'" type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="3" />
        <el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" />
      </el-form-item></FormField>
      <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
    </form></FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
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
  form.onValuesChange((v: Record<string, unknown>) => { if (isRestoring) return; history.value = history.value.slice(0, historyIdx.value + 1); history.value.push({ ...v }); if (history.value.length > 50) history.value.shift(); historyIdx.value = history.value.length - 1 })
})
function undo(): void { if (historyIdx.value <= 0) return; historyIdx.value--; isRestoring = true; form.setValues(history.value[historyIdx.value]); isRestoring = false }
function redo(): void { if (historyIdx.value >= history.value.length - 1) return; historyIdx.value++; isRestoring = true; form.setValues(history.value[historyIdx.value]); isRestoring = false }
function onKeyDown(e: KeyboardEvent): void { if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }; if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo() } }
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
