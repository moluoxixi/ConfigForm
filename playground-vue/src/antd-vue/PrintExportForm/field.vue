<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      打印预览 / 导出 JSON / 导出 CSV
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <!-- 导出操作按钮（附加内容） -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px">
            <button type="button" style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="handlePrint">
              打印
            </button>
            <button type="button" style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="exportJson">
              导出 JSON
            </button>
            <button type="button" style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="exportCsv">
              导出 CSV
            </button>
          </div>
          <!-- 表单字段 -->
          <FormField v-for="d in FIELD_DEFS" :key="d.name" :name="d.name" :field-props="getFieldProps(d)" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 打印 / 导出表单 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps。打印和导出按钮作为附加内容，
 * 通过 form.getFieldValue 读取表单值进行打印/导出。
 */
import { ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea'
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'orderNo', label: '订单号', type: 'text' },
  { name: 'customer', label: '客户', type: 'text' },
  { name: 'amount', label: '金额', type: 'number' },
  { name: 'date', label: '日期', type: 'text' },
  { name: 'address', label: '地址', type: 'text' },
  { name: 'remark', label: '备注', type: 'textarea' },
]

/** 根据字段定义生成 fieldProps */
function getFieldProps(d: FieldDef): Record<string, unknown> {
  const base: Record<string, unknown> = { label: d.label }
  if (d.type === 'number') {
    base.component = 'InputNumber'
    base.componentProps = { style: 'width: 100%' }
  }
  else if (d.type === 'textarea') {
    base.component = 'Textarea'
    base.componentProps = { rows: 2 }
  }
  else {
    base.component = 'Input'
  }
  return base
}

const form = useCreateForm({
  initialValues: {
    orderNo: 'ORD-20260207-001',
    customer: '张三',
    amount: 9999,
    date: '2026-02-07',
    address: '北京市朝阳区',
    remark: '加急处理',
  },
})

/** 通用文件下载工具 */
function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** 打印：新窗口输出表格并调用 print */
function handlePrint(): void {
  const w = window.open('', '_blank')
  if (!w) return
  const rows = FIELD_DEFS.map(d =>
    `<tr><th>${d.label}</th><td>${String(form.getFieldValue(d.name) ?? '')}</td></tr>`,
  ).join('')
  w.document.write(
    `<html><head><title>打印</title><style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>表单数据</h2><table>${rows}</table></body></html>`,
  )
  w.document.close()
  w.print()
}

/** 导出 JSON 文件 */
function exportJson(): void {
  const data: Record<string, unknown> = {}
  FIELD_DEFS.forEach((d) => {
    data[d.name] = form.getFieldValue(d.name)
  })
  downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json')
}

/** 导出 CSV 文件（含 BOM 头以支持 Excel） */
function exportCsv(): void {
  const headers = FIELD_DEFS.map(d => d.label).join(',')
  const values = FIELD_DEFS.map(d =>
    `"${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"`,
  ).join(',')
  downloadFile(`\uFEFF${headers}\n${values}`, 'form-data.csv', 'text/csv;charset=utf-8')
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
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
