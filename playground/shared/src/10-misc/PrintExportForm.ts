import type { SceneConfig } from '../types'
import type { FormInstance } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'

/**
 * 场景：导出 JSON / CSV
 *
 * 演示通过 effects 读取表单值并生成导出内容：
 * - 提交时自动生成 JSON 和 CSV 格式的导出预览
 * - 展示 form.values 的序列化能力
 *
 * 注意：打印功能依赖浏览器 API（window.print），
 * 在 Schema 层面通过 effects 监听提交事件来触发导出。
 */

const config: SceneConfig = {
  title: '导出 JSON / CSV',
  description: '提交后查看 JSON 和 CSV 格式的导出内容',

  initialValues: {
    orderNo: 'ORD-20260207-001',
    customer: '张三',
    amount: 9999,
    date: '2026-02-07',
    address: '北京市朝阳区',
    remark: '加急处理',
    _exportJson: '',
    _exportCsv: '',
  },

  effects: (form: FormInstance): void => {
    /**
     * 监听值变化，实时生成 JSON 和 CSV 导出预览。
     * 排除以 _ 开头的内部字段。
     */
    const updateExport = (): void => {
      setTimeout(() => {
        const values = form.values as Record<string, unknown>
        const exportData: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(values)) {
          if (!key.startsWith('_')) {
            exportData[key] = value
          }
        }

        /* JSON 导出 */
        const jsonStr = JSON.stringify(exportData, null, 2)
        const jsonField = form.getField('_exportJson')
        if (jsonField) {
          jsonField.setValue(jsonStr)
        }

        /* CSV 导出 */
        const headers = Object.keys(exportData)
        const csvValues = headers.map(h => {
          const v = exportData[h]
          const str = String(v ?? '')
          return str.includes(',') ? `"${str}"` : str
        })
        const csvStr = headers.join(',') + '\n' + csvValues.join(',')
        const csvField = form.getField('_exportCsv')
        if (csvField) {
          csvField.setValue(csvStr)
        }
      }, 50)
    }

    form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
      updateExport()
    })

    form.onValuesChange(() => {
      updateExport()
    })
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      orderNo: { type: 'string', title: '订单号' },
      customer: { type: 'string', title: '客户' },
      amount: { type: 'number', title: '金额', componentProps: { style: 'width: 100%' } },
      date: { type: 'string', title: '日期' },
      address: { type: 'string', title: '地址' },
      remark: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 2 } },
      _exportJson: {
        type: 'string',
        title: 'JSON 导出预览',
        component: 'Textarea',
        preview: true,
        componentProps: { rows: 8, style: 'font-family: monospace; font-size: 12px' },
        description: '修改上方字段后实时更新',
      },
      _exportCsv: {
        type: 'string',
        title: 'CSV 导出预览',
        component: 'Textarea',
        preview: true,
        componentProps: { rows: 3, style: 'font-family: monospace; font-size: 12px' },
        description: '逗号分隔格式',
      },
    },
  },
}

export default config
