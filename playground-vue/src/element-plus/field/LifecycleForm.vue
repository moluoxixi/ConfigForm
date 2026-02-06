<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">onMount / onChange / onSubmit / onReset / 自动保存</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <el-space style="margin-bottom: 12px"><span>自动保存：</span><el-switch v-model="autoSave" /></el-space>
        <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
          <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n"><el-form-item :label="field.label">
            <el-input-number v-if="n === 'price'" :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
            <el-input v-else-if="n === 'description'" type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="3" />
            <el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" />
          </el-form-item></FormField>
          <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="handleReset">重置</el-button></el-space>
        </form></FormProvider>
      </div>
      <el-card :title="`事件日志 (${logs.length})`" shadow="never" style="width: 360px"><template #header><div style="display: flex; justify-content: space-between; align-items: center;"><strong>事件日志</strong><el-button size="small" text @click="logs = []">清空</el-button></div></template>
        <div style="max-height: 400px; overflow: auto; font-size: 12px"><div v-for="log in logs" :key="log.id" style="padding: 2px 0; border-bottom: 1px solid #f0f0f0"><el-tag :type="typeColors[log.type]" style="font-size: 10px">{{ log.type }}</el-tag><span style="color: #999">{{ log.time }}</span><div style="color: #555; margin-top: 2px">{{ log.message }}</div></div></div>
      </el-card>
    </div>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem, ElCard, ElTag, ElSwitch } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const autoSave = ref(true)
const FIELDS = ['title', 'price', 'description']
interface Log { id: number; time: string; type: string; message: string }
const logs = ref<Log[]>([])
let logId = 0
const typeColors: Record<string, string> = { mount: 'purple', change: 'primary', submit: 'success', reset: 'warning', 'auto-save': 'info' }
function addLog(type: string, msg: string): void { logId++; logs.value = [{ id: logId, time: new Date().toLocaleTimeString(), type, message: msg }, ...logs.value].slice(0, 50) }
const form = useCreateForm({ initialValues: { title: '生命周期测试', price: 99, description: '' } })
let timer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'price', label: '价格' }); form.createField({ name: 'description', label: '描述' })
  addLog('mount', '表单已挂载')
  form.onValuesChange((v: Record<string, unknown>) => {
    addLog('change', `值变化：${JSON.stringify(v).slice(0, 80)}...`)
    if (timer) clearTimeout(timer)
    if (autoSave.value) { timer = setTimeout(() => { addLog('auto-save', '自动保存到 localStorage'); try { localStorage.setItem('vue-lifecycle-auto', JSON.stringify(v)) } catch { /* */ } }, 1500) }
  })
})
onUnmounted(() => { if (timer) clearTimeout(timer) })
function handleReset(): void { addLog('reset', '表单已重置'); form.reset() }
async function handleSubmit(): Promise<void> { addLog('submit', '提交开始'); const res = await form.submit(); if (res.errors.length > 0) { addLog('submit', '提交失败'); result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { addLog('submit', '提交成功'); result.value = JSON.stringify(res.values, null, 2) } }
</script>
