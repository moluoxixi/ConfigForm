import type { SceneConfig } from '../types'
import type { FormInstance } from '@moluoxixi/core'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'
import type { DirtyCheckerPluginAPI, LowerCodePluginAPI } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：表单比对
 *
 * 演示 lowerCodePlugin.dirtyChecker 的实际对比能力：
 * - 修改任意字段后，diff 视图实时更新
 * - 表格化纯文本展示：字段 | 原始值 → 当前值 | 状态
 */

/** 字段路径 → 中文标签映射 */
const FIELD_LABELS: Record<string, string> = {
  name: '姓名',
  email: '邮箱',
  phone: '电话',
  salary: '薪资',
  department: '部门',
  bio: '简介',
}

/** 变更类型标记 */
const TYPE_ICONS: Record<string, string> = {
  changed: '✏️',
  added: '➕',
  removed: '❌',
}

function formatVal(val: unknown): string {
  if (val === undefined || val === null) return '—'
  if (typeof val === 'string' && val === '') return '(空)'
  return String(val)
}

function padRight(str: string, len: number): string {
  const cjkCount = str.split('').filter(c => c.charCodeAt(0) > 127).length
  const totalLen = str.length + cjkCount
  return str + ' '.repeat(Math.max(0, len - totalLen))
}

const config: SceneConfig = {
  title: '表单比对',
  description: 'dirtyChecker — 修改字段后实时对比变更',

  initialValues: {
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138000',
    salary: 25000,
    department: '技术部',
    bio: '5 年前端经验',
    _diffLog: '',
  },

  effects: (form: FormInstance): void => {
    form.onValuesChange(() => {
      setTimeout(() => {
        const lc = form.getPlugin<LowerCodePluginAPI>('lower-code')
        const checker = lc?.dirtyChecker as DirtyCheckerPluginAPI | undefined
        if (!checker) return

        const result = checker.check()
        /* 过滤掉 _diffLog 自身 */
        const diffs = result.diffs.filter(d => !d.path.startsWith('_'))

        if (diffs.length === 0) {
          const logField = form.getField('_diffLog')
          if (logField) logField.setValue('✅ 无变更')
          return
        }

        const lines: string[] = []
        lines.push(`📋 对比结果（${diffs.length} 处变更）`)
        lines.push('─'.repeat(50))
        lines.push('')

        for (const diff of diffs) {
          const label = FIELD_LABELS[diff.path] ?? diff.path
          const icon = TYPE_ICONS[diff.type] ?? '?'
          lines.push(`${icon} ${label}`)
          lines.push(`   ${formatVal(diff.initialValue)}  →  ${formatVal(diff.currentValue)}`)
          lines.push('')
        }

        const logField = form.getField('_diffLog')
        if (logField) {
          logField.setValue(lines.join('\n'))
        }
      }, 50)
    })
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      name: { type: 'string', title: '姓名' },
      email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', title: '电话', rules: [{ format: 'phone', message: '无效手机号' }] },
      salary: { type: 'number', title: '薪资', componentProps: { style: 'width: 100%' } },
      department: { type: 'string', title: '部门' },
      bio: { type: 'string', title: '简介', component: 'Textarea', componentProps: { rows: 2 } },
      _diffLog: {
        type: 'string',
        title: '对比结果',
        component: 'Textarea',
        readOnly: true,
        componentProps: { rows: 10, style: 'font-family: monospace; font-size: 13px; background: #1a1a2e; color: #e0e0e0; padding: 12px; border-radius: 8px; border: none; line-height: 1.6' },
        description: '修改上方任意字段后，实时显示 diff 结果',
      },
    },
  },

  plugins: [
    lowerCodePlugin({
      history: false,
      acl: false,
      submitRetry: false,
      subForm: false,
    }),
  ],
}

export default config
