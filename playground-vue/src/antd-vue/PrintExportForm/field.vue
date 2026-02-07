<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">打印预览 / 导出 JSON / 导出 CSV</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ASpace style="margin-bottom: 16px"><AButton @click="handlePrint">打印</AButton><AButton @click="exportJson">导出 JSON</AButton><AButton @click="exportCsv">导出 CSV</AButton></ASpace>
        <FormField v-for="d in FIELDS" :key="d.name" v-slot="{ field }" :name="d.name"><AFormItem :label="d.label">
          <template v-if="mode === 'readOnly'"><span v-if="d.type === 'textarea'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ field.value ?? '—' }}</span></template>
          <template v-else><AInputNumber v-if="d.type === 'number'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
          <ATextarea v-else-if="d.type === 'textarea'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="2" />
          <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></template>
        </AFormItem></FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Textarea as ATextarea } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
const FIELDS = [{ name: 'orderNo', label: '订单号', type: 'text' }, { name: 'customer', label: '客户', type: 'text' }, { name: 'amount', label: '金额', type: 'number' }, { name: 'date', label: '日期', type: 'text' }, { name: 'address', label: '地址', type: 'text' }, { name: 'remark', label: '备注', type: 'textarea' }]
const form = useCreateForm({ initialValues: { orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999, date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理' } })
onMounted(() => { FIELDS.forEach(d => form.createField({ name: d.name, label: d.label })) })
function downloadFile(content: string, filename: string, mime: string): void { const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url) }
function handlePrint(): void { const w = window.open('', '_blank'); if (!w) return; w.document.write(`<html><head><title>打印</title><style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>表单数据</h2><table>${FIELDS.map(d => `<tr><th>${d.label}</th><td>${String(form.getFieldValue(d.name) ?? '')}</td></tr>`).join('')}</table></body></html>`); w.document.close(); w.print() }
function exportJson(): void { const data: Record<string, unknown> = {}; FIELDS.forEach(d => { data[d.name] = form.getFieldValue(d.name) }); downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json') }
function exportCsv(): void { const h = FIELDS.map(d => d.label).join(','); const v = FIELDS.map(d => `"${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"`).join(','); downloadFile(`\uFEFF${h}\n${v}`, 'form-data.csv', 'text/csv;charset=utf-8') }
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}
</script>
