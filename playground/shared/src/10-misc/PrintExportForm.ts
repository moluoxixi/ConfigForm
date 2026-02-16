import type { SceneConfig } from '../types'

/**
 * 场景：打印 / 导入 / 导出（插件化）
 *
 * 交互入口由 schema.decoratorProps.actions 声明：
 * - 导出 JSON（弹窗预览 + 下载）
 * - 导入 JSON（弹窗预览 + 可编辑后回填）
 * - 打印（临时切到阅读态后打印预览态表单 DOM）
 */
const config: SceneConfig = {
  title: '打印 / 导入 / 导出（插件化）',
  description: '通过 plugin-export / plugin-import / plugin-print 插件提供打印与 JSON 导入导出能力，核心表单保持轻量',

  initialValues: {
    orderNo: 'ORD-20260207-001',
    customer: '张三',
    amount: 9999,
    date: '2026-02-07',
    address: '北京市朝阳区',
    remark: '加急处理',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '100px',
      actions: {
        submit: '提交',
        reset: '重置',
        print: '打印预览',
        export: '导出预览',
        import: {
          buttonText: '导入 JSON',
          showStrategy: true,
        },
      },
    },
    properties: {
      orderNo: { type: 'string', title: '订单号', required: true },
      customer: { type: 'string', title: '客户', required: true },
      amount: {
        type: 'number',
        title: '金额',
        required: true,
        componentProps: { style: 'width: 100%' },
      },
      date: { type: 'string', title: '日期' },
      address: { type: 'string', title: '地址' },
      remark: {
        type: 'string',
        title: '备注',
        component: 'Textarea',
        componentProps: { rows: 2 },
      },
    },
  },
}

export default config
