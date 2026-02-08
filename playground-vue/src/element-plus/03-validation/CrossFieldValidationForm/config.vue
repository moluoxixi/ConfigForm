<template>
  <div>
    <h2>跨字段验证</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      密码一致性 / 日期范围 / 比例总和=100% / 数值区间 / 预算限制 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 跨字段验证 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现跨字段验证：
 * - 密码一致性校验
 * - 日期范围（结束 >= 开始）
 * - 比例总和 = 100%
 * - 数值区间（最大 > 最小）
 * - 预算限制（支出 <= 预算）
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  password: '', confirmPassword: '', startDate: '', endDate: '',
  ratioA: 40, ratioB: 30, ratioC: 30,
  minAge: 18, maxAge: 60,
  budget: 10000, expense: 0,
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    password: {
      type: 'string', title: '密码', required: true, component: 'Password',
      rules: [{ minLength: 8, message: '至少 8 字符' }],
    },
    confirmPassword: {
      type: 'string', title: '确认密码', required: true, component: 'Password',
      rules: [{
        validator: (v: unknown, _r: unknown, ctx: any) => {
          if (v && ctx.getFieldValue('password') && v !== ctx.getFieldValue('password'))
            return '密码不一致'
          return undefined
        },
        trigger: 'blur',
      }],
    },
    startDate: { type: 'date', title: '开始日期', required: true },
    endDate: {
      type: 'date', title: '结束日期', required: true,
      rules: [{
        validator: (v: unknown, _r: unknown, ctx: any) => {
          const s = ctx.getFieldValue('startDate') as string
          if (s && v && String(v) < s) return '结束日期不能早于开始日期'
          return undefined
        },
        trigger: 'blur',
      }],
    },
    ratioA: {
      type: 'number', title: '项目 A（%）', required: true, default: 40,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
      description: 'A+B+C=100',
    },
    ratioB: {
      type: 'number', title: '项目 B（%）', required: true, default: 30,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
    },
    ratioC: {
      type: 'number', title: '项目 C（%）', required: true, default: 30,
      component: 'InputNumber', componentProps: { min: 0, max: 100, style: 'width: 100%' },
      rules: [{
        validator: (_v: unknown, _r: unknown, ctx: any) => {
          const t = ((ctx.getFieldValue('ratioA') as number) ?? 0) + ((ctx.getFieldValue('ratioB') as number) ?? 0) + ((ctx.getFieldValue('ratioC') as number) ?? 0)
          if (t !== 100) return `总和须为 100%，当前 ${t}%`
          return undefined
        },
        trigger: 'blur',
      }],
    },
    minAge: {
      type: 'number', title: '最小年龄', required: true, default: 18,
      component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' },
    },
    maxAge: {
      type: 'number', title: '最大年龄', required: true, default: 60,
      component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' },
      rules: [{
        validator: (v: unknown, _r: unknown, ctx: any) => {
          if (Number(v) <= (ctx.getFieldValue('minAge') as number)) return '须大于最小年龄'
          return undefined
        },
        trigger: 'blur',
      }],
    },
    budget: {
      type: 'number', title: '预算上限', required: true, default: 10000,
      component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' },
    },
    expense: {
      type: 'number', title: '实际支出', required: true, default: 0,
      component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' },
      rules: [{
        validator: (v: unknown, _r: unknown, ctx: any) => {
          if (Number(v) > (ctx.getFieldValue('budget') as number)) return '支出不能超过预算'
          return undefined
        },
        trigger: 'blur',
      }],
    },
  },
}
</script>
