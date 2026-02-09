import type { SceneConfig } from '../types'
import type { FormInstance } from '@moluoxixi/core'
import { lowerCodePlugin } from '@moluoxixi/plugin-lower-code'
import type { DirtyCheckerPluginAPI, LowerCodePluginAPI } from '@moluoxixi/plugin-lower-code'

/**
 * 场景：表单比对
 *
 * 演示 lowerCodePlugin.dirtyChecker 的实际对比能力：
 * - 修改任意字段后，diff 日志实时更新
 * - 显示哪些字段被修改、原始值 vs 当前值
 * - 统计脏字段数量
 */

const config: SceneConfig = {
  title: '表单比对',
  description: 'dirtyChecker — 修改字段后查看 diff 日志（实时对比）',

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
    /**
     * 监听所有字段值变化，每次变化后调用 dirtyChecker.check()，
     * 将 diff 结果写入 _diffLog 字段展示。
     */
    form.onValuesChange(() => {
      setTimeout(() => {
        const lc = form.getPlugin<LowerCodePluginAPI>('lower-code')
        const checker = lc?.dirtyChecker as DirtyCheckerPluginAPI | undefined
        if (!checker) return

        const result = checker.check()
        const lines: string[] = []

        lines.push(`=== 表单比对结果 ===`)
        lines.push(`是否有修改: ${result.isDirty ? '是' : '否'}`)
        lines.push(`脏字段数量: ${result.diffs.length}`)
        lines.push('')

        if (result.diffs.length > 0) {
          lines.push('--- 变更详情 ---')
          for (const diff of result.diffs) {
            lines.push(`字段: ${diff.path}`)
            lines.push(`  类型: ${diff.type}`)
            lines.push(`  原始值: ${JSON.stringify(diff.oldValue)}`)
            lines.push(`  当前值: ${JSON.stringify(diff.newValue)}`)
            lines.push('')
          }
        } else {
          lines.push('（无变更）')
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
        componentProps: { rows: 12, style: 'font-family: monospace; font-size: 12px' },
        description: '修改上方任意字段后，这里实时显示 diff 结果',
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
