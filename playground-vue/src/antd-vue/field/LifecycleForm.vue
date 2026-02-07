<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">onMount / onChange / onSubmit / onReset / 自动保存</p>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <PlaygroundForm :form="form">
          <template #default="{ form: f, mode }">
            <ASpace style="margin-bottom: 12px"><span>自动保存：</span><ASwitch v-model:checked="autoSave" /></ASpace>
            <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label">
              <template v-if="mode === 'readOnly'"><span v-if="n === 'description'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ field.value ?? '—' }}</span></template>
              <template v-else><AInputNumber v-if="n === 'price'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
              <ATextarea v-else-if="n === 'description'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="3" />
              <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></template>
            </AFormItem></FormField>
          </template>
        </PlaygroundForm>
      </div>
      <ACard :title="`事件日志 (${logs.length})`" size="small" style="width: 360px"><template #extra><AButton size="small" @click="logs = []">清空</AButton></template>
        <div style="max-height: 400px; overflow: auto; font-size: 12px"><div v-for="log in logs" :key="log.id" style="padding: 2px 0; border-bottom: 1px solid #f0f0f0"><ATag :color="typeColors[log.type]" style="font-size: 10px">{{ log.type }}</ATag><span style="color: #999">{{ log.time }}</span><div style="color: #555; margin-top: 2px">{{ log.message }}</div></div></div>
      </ACard>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Textarea as ATextarea, Tag as ATag, Switch as ASwitch } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const autoSave = ref(true)
const FIELDS = ['title', 'price', 'description']
interface Log { id: number; time: string; type: string; message: string }
const logs = ref<Log[]>([])
let logId = 0
const typeColors: Record<string, string> = { mount: 'purple', change: 'blue', submit: 'green', reset: 'orange', 'auto-save': 'cyan' }
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
</script>
