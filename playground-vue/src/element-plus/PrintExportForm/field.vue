<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      打印预览 / 导出 JSON / 导出 CSV
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="handlePrint">
        🖨️ 打印
      </button>
      <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="exportJson">
        📄 导出 JSON
      </button>
      <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="exportCsv">
        📊 导出 CSV
      </button>
    </div>
    <FormProvider :form="form">
        <FormField v-for="d in FIELDS" :key="d.name" v-slot="{ field }" :name="d.name">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ d.label }}</label>
            <input v-if="d.type === 'number'" type="number" :value="(field.value as number)" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
            <textarea v-else-if="d.type === 'textarea'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" rows="2" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
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
</script>
