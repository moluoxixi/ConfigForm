import type { ValidationRule } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

const maxAgeRules: ValidationRule[] = [{
  /**
   * validator：执行当前功能逻辑。
   *
   * @param v 参数 v 的输入说明。
   * @param _r 参数 _r 的输入说明。
   * @param ctx 参数 ctx 的输入说明。
   *
   * @returns 返回当前功能的处理结果。
   */

  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    if (Number(v) <= (ctx.getFieldValue('minAge') as number))
      return '须大于最小年龄'
    return undefined
  },
  trigger: 'blur',
}]

/** 实际支出规则：不能超过预算 */
const expenseRules: ValidationRule[] = [{
  /**
   * validator：执行当前功能逻辑。
   *
   * @param v 参数 v 的输入说明。
   * @param _r 参数 _r 的输入说明。
   * @param ctx 参数 ctx 的输入说明。
   *
   * @returns 返回当前功能的处理结果。
   */

  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    if (Number(v) > (ctx.getFieldValue('budget') as number))
      return '支出不能超过预算'
    return undefined
  },
  trigger: 'blur',
}]

/**
 * config：变量或常量声明。
 * 所属模块：`playground/shared/src/03-validation/CrossFieldValidationForm.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const config: SceneConfig = {
  title: '跨字段验证',
  description: '密码一致性 / 日期范围 / 比例总和=100% / 数值区间 / 预算限制',

  initialValues: {
    password: '',
    confirmPassword: '',
    startDate: '',
    endDate: '',
    ratioA: 40,
    ratioB: 30,
    ratioC: 30,
    minAge: 18,
    maxAge: 60,
    budget: 10000,
    expense: 0,
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '150px' },
    properties: {
      password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 字符' }] },
      confirmPassword: { type: 'string', title: '确认密码', required: true, component: 'Password', rules: confirmPasswordRules },
      startDate: { type: 'string', title: '开始日期', required: true },
      endDate: { type: 'string', title: '结束日期', required: true, rules: endDateRules },
      ratioA: { type: 'number', title: '项目 A（%）', required: true, default: 40, componentProps: { min: 0, max: 100, style: { width: '100%' } }, description: 'A+B+C=100' },
      ratioB: { type: 'number', title: '项目 B（%）', required: true, default: 30, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
      ratioC: { type: 'number', title: '项目 C（%）', required: true, default: 30, componentProps: { min: 0, max: 100, style: { width: '100%' } }, rules: ratioCRules },
      minAge: { type: 'number', title: '最小年龄', required: true, default: 18, componentProps: { min: 0, max: 150, style: { width: '100%' } } },
      maxAge: { type: 'number', title: '最大年龄', required: true, default: 60, componentProps: { min: 0, max: 150, style: { width: '100%' } }, rules: maxAgeRules },
      budget: { type: 'number', title: '预算上限', required: true, default: 10000, componentProps: { min: 0, style: { width: '100%' } } },
      expense: { type: 'number', title: '实际支出', required: true, default: 0, componentProps: { min: 0, style: { width: '100%' } }, rules: expenseRules },
    },
  },
}

export default config
