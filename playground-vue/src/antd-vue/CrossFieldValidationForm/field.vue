<template>
  <div>
    <h2>跨字段验证（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      密码一致性 / 日期范围 / 比例总和=100% / 数值区间 / 预算限制 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="password" :field-props="{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '请输入密码' }, rules: [{ minLength: 8, message: '至少 8 字符' }] }" />
          <FormField name="confirmPassword" :field-props="{ label: '确认密码', required: true, component: 'Password', componentProps: { placeholder: '请再次输入密码' }, rules: confirmPasswordRules }" />
          <FormField name="startDate" :field-props="{ label: '开始日期', required: true, component: 'Input', componentProps: { placeholder: '如 2024-01-01' } }" />
          <FormField name="endDate" :field-props="{ label: '结束日期', required: true, component: 'Input', componentProps: { placeholder: '如 2024-12-31' }, rules: endDateRules }" />
          <FormField name="ratioA" :field-props="{ label: '项目 A（%）', required: true, component: 'InputNumber', description: 'A+B+C=100', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="ratioB" :field-props="{ label: '项目 B（%）', required: true, component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } } }" />
          <FormField name="ratioC" :field-props="{ label: '项目 C（%）', required: true, component: 'InputNumber', componentProps: { min: 0, max: 100, style: { width: '100%' } }, rules: ratioCRules }" />
          <FormField name="minAge" :field-props="{ label: '最小年龄', required: true, component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } } }" />
          <FormField name="maxAge" :field-props="{ label: '最大年龄', required: true, component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } }, rules: maxAgeRules }" />
          <FormField name="budget" :field-props="{ label: '预算上限', required: true, component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }" />
          <FormField name="expense" :field-props="{ label: '实际支出', required: true, component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } }, rules: expenseRules }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 跨字段验证规则 ==========

/** 确认密码规则：与密码一致 */
const confirmPasswordRules = [{
  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    if (v && ctx.getFieldValue('password') && v !== ctx.getFieldValue('password'))
      return '密码不一致'
    return undefined
  },
  trigger: 'blur',
}]

/** 结束日期规则：不能早于开始日期 */
const endDateRules = [{
  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    const s = ctx.getFieldValue('startDate') as string
    if (s && v && String(v) < s)
      return '结束日期不能早于开始日期'
    return undefined
  },
  trigger: 'blur',
}]

/** 项目 C 比例规则：A+B+C 须等于 100 */
const ratioCRules = [{
  validator: (_v: unknown, _r: unknown, ctx: any): string | undefined => {
    const t = ((ctx.getFieldValue('ratioA') as number) ?? 0)
      + ((ctx.getFieldValue('ratioB') as number) ?? 0)
      + ((ctx.getFieldValue('ratioC') as number) ?? 0)
    if (t !== 100)
      return `总和须为 100%，当前 ${t}%`
    return undefined
  },
  trigger: 'blur',
}]

/** 最大年龄规则：须大于最小年龄 */
const maxAgeRules = [{
  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    if (Number(v) <= (ctx.getFieldValue('minAge') as number))
      return '须大于最小年龄'
    return undefined
  },
  trigger: 'blur',
}]

/** 实际支出规则：不能超过预算 */
const expenseRules = [{
  validator: (v: unknown, _r: unknown, ctx: any): string | undefined => {
    if (Number(v) > (ctx.getFieldValue('budget') as number))
      return '支出不能超过预算'
    return undefined
  },
  trigger: 'blur',
}]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { password: '', confirmPassword: '', startDate: '', endDate: '', ratioA: 40, ratioB: 30, ratioC: 30, minAge: 18, maxAge: 60, budget: 10000, expense: 0 },
})

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
