<template>
  <div>
    <h2>动态 Schema</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      场景切换 / 动态字段组合 — FormField + 条件渲染实现
    </p>
    <div style="display: inline-flex; border: 1px solid #d9d9d9; border-radius: 6px; overflow: hidden; margin-bottom: 12px">
      <button v-for="opt in scenarioOptions" :key="opt.value" :style="{ padding: '4px 12px', border: 'none', cursor: 'pointer', background: scenario === opt.value ? '#1677ff' : '#fff', color: scenario === opt.value ? '#fff' : 'inherit', fontSize: '14px' }" @click="scenario = opt.value as ScenarioKey">
        {{ opt.label }}
      </button>
    </div>
    <span style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; color: #52c41a; margin-bottom: 12px">
      当前：{{ SCENARIOS[scenario].label }} | 字段数：{{ SCENARIOS[scenario].fields.length }}
    </span>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <!-- 公共字段 -->
          <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] }" />
          <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] }" />
          <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] }" />
          <!-- 个人用户字段 -->
          <template v-if="scenario === 'individual'">
            <FormField name="idCard" :field-props="{ label: '身份证', required: true, component: 'Input', rules: [{ pattern: '^\\d{17}[\\dX]$', message: '无效身份证' }] }" />
            <FormField name="city" :field-props="{ label: '城市', component: 'Select', dataSource: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] }" />
          </template>
          <!-- 企业用户字段 -->
          <template v-if="scenario === 'enterprise'">
            <FormField name="companyName" :field-props="{ label: '公司名称', required: true, component: 'Input' }" />
            <FormField name="creditCode" :field-props="{ label: '信用代码', required: true, component: 'Input', rules: [{ pattern: '^[0-9A-Z]{18}$', message: '18 位信用代码' }] }" />
          </template>
          <!-- 学生认证字段 -->
          <template v-if="scenario === 'student'">
            <FormField name="school" :field-props="{ label: '学校', required: true, component: 'Input' }" />
            <FormField name="studentId" :field-props="{ label: '学号', required: true, component: 'Input', rules: [{ pattern: '^\\d{8,14}$', message: '8-14 位数字' }] }" />
            <FormField name="major" :field-props="{ label: '专业', required: true, component: 'Input' }" />
          </template>
          <!-- 公共备注 -->
          <FormField name="remark" :field-props="{ label: '备注', component: 'Textarea' }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 动态 Schema — Field 模式
 *
 * 使用 FormProvider + FormField + 条件渲染（v-if）实现场景切换。
 * 不同场景展示不同字段组合，公共字段始终显示。
 */
import { ref, watch } from 'vue'

setupElementPlus()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 场景类型 */
type ScenarioKey = 'individual' | 'enterprise' | 'student'

const scenario = ref<ScenarioKey>('individual')
const scenarioOptions = [
  { label: '个人用户', value: 'individual' },
  { label: '企业用户', value: 'enterprise' },
  { label: '学生认证', value: 'student' },
]

/** 场景配置 */
const SCENARIOS: Record<ScenarioKey, { label: string; fields: string[] }> = {
  individual: { label: '个人用户', fields: ['name', 'phone', 'email', 'idCard', 'city', 'remark'] },
  enterprise: { label: '企业用户', fields: ['name', 'phone', 'email', 'companyName', 'creditCode', 'remark'] },
  student: { label: '学生认证', fields: ['name', 'phone', 'email', 'school', 'studentId', 'major', 'remark'] },
}

const form = useCreateForm({
  initialValues: {
    name: '',
    phone: '',
    email: '',
    idCard: '',
    city: undefined,
    companyName: '',
    creditCode: '',
    school: '',
    studentId: '',
    major: '',
    remark: '',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
