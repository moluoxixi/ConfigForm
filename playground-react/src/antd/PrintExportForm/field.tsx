import { DownloadOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import {
  Button,
  Space,
  Typography,
} from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 48：打印、导出
 *
 * 覆盖：
 * - 打印预览（window.print）
 * - 导出 JSON
 * - 导出 CSV
 * - 三种模式切换
 *
 * 所有字段使用 FormField + fieldProps。打印和导出按钮作为附加内容，
 * 通过 form.getFieldValue 读取表单值进行打印/导出。
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 字段定义接口 */
interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea'
}

/** 字段定义 */
const FIELD_DEFS: FieldDef[] = [
  { name: 'orderNo', label: '订单号', type: 'text' },
  { name: 'customer', label: '客户名称', type: 'text' },
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
    base.componentProps = { style: { width: '100%' } }
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

/** 通用文件下载工具 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const PrintExportForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999, date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理' },
  })

  /** 打印：新窗口输出表格并调用 print */
  const handlePrint = (): void => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const rows = FIELD_DEFS.map(d =>
      `<tr><th>${d.label}</th><td>${String(form.getFieldValue(d.name) ?? '')}</td></tr>`,
    ).join('')
    printWindow.document.write(
      `<html><head><title>打印预览</title><style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>表单数据</h2><table>${rows}</table></body></html>`,
    )
    printWindow.document.close()
    printWindow.print()
  }

  /** 导出 JSON 文件 */
  const exportJson = (): void => {
    const data: Record<string, unknown> = {}
    FIELD_DEFS.forEach((d) => {
      data[d.name] = form.getFieldValue(d.name)
    })
    downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json')
  }

  /** 导出 CSV 文件（含 BOM 头以支持 Excel） */
  const exportCsv = (): void => {
    const headers = FIELD_DEFS.map(d => d.label).join(',')
    const values = FIELD_DEFS.map(d => `"${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"`).join(',')
    downloadFile(`\uFEFF${headers}\n${values}`, 'form-data.csv', 'text/csv;charset=utf-8')
  }

  return (
    <div>
      <Title level={3}>打印、导出</Title>
      <Paragraph type="secondary">打印预览（window.print） / 导出 JSON / 导出 CSV</Paragraph>

      {/* 导出操作按钮（附加内容） */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>打印</Button>
        <Button icon={<DownloadOutlined />} onClick={exportJson}>导出 JSON</Button>
        <Button icon={<FileTextOutlined />} onClick={exportCsv}>导出 CSV</Button>
      </Space>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                {FIELD_DEFS.map(d => (
                  <FormField key={d.name} name={d.name} fieldProps={getFieldProps(d)} />
                ))}
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
