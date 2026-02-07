<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      打印预览 / 导出 JSON / 导出 CSV
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <ElSpace style="margin-bottom: 16px">
      <ElButton @click="handlePrint">
        打印
      </ElButton><ElButton @click="exportJson">
        导出 JSON
      </ElButton><ElButton @click="exportCsv">
        导出 CSV
      </ElButton>
    </ElSpace>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-for="d in FIELDS" :key="d.name" v-slot="{ field }" :name="d.name">
          <ElFormItem :label="d.label">
            <ElInputNumber v-if="d.type === 'number'" :model-value="(field.value as number)" :disabled="mode === 'disabled'" style="width: 100%" @update:model-value="field.setValue($event)" />
            <ElInput v-else-if="d.type === 'textarea'" type="textarea" :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :rows="2" @update:model-value="field.setValue($event)" />
            <ElInput v-else :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElInputNumber, ElRadioButton, ElRadioGroup, ElSpace } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const FIELDS = [{ name: 'orderNo', label: '订单号', type: 'text' }, { name: 'customer', label: '客户', type: 'text' }, { name: 'amount', label: '金额', type: 'number' }, { name: 'date', label: '日期', type: 'text' }, { name: 'address', label: '地址', type: 'text' }, { name: 'remark', label: '备注', type: 'textarea' }]
const form = useCreateForm({ initialValues: { orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999, date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理' } })
onMounted(() => {
  FIELDS.forEach(d => form.createField({ name: d.name, label: d.label }))
})
function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
function handlePrint(): void {
  const w = window.open('', '_blank')
  if (!w)
    return
  w.document.write(`<html><head><title>打印</title><style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>表单数据</h2><table>${FIELDS.map(d => `<tr><th>${d.label}</th><td>${String(form.getFieldValue(d.name) ?? '')}</td></tr>`).join('')}</table></body></html>`)
  w.document.close()
  w.print()
}
function exportJson(): void {
  const data: Record<string, unknown> = {}
  FIELDS.forEach((d) => {
    data[d.name] = form.getFieldValue(d.name)
  })
  downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json')
}
function exportCsv(): void {
  const h = FIELDS.map(d => d.label).join(',')
  const v = FIELDS.map(d => `"${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"`).join(',')
  downloadFile(`\uFEFF${h}\n${v}`, 'form-data.csv', 'text/csv;charset=utf-8')
}
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
