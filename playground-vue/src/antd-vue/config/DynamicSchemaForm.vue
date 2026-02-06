<template>
  <div>
    <h2>动态 Schema</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">mergeSchema 合并 / 场景切换 / 热更新</p>
    <ASpace direction="vertical" :style="{ width: '100%', marginBottom: '16px' }">
      <ASegmented v-model:value="mode" :options="MODE_OPTIONS" />
      <ASegmented v-model:value="scenario" :options="scenarioOptions" @change="result = ''" />
    </ASpace>
    <ATag color="green" style="margin-bottom: 12px">当前：{{ SCENARIOS[scenario].label }} | 字段数：{{ Object.keys(mergedSchema.fields).length }}</ATag>
    <ConfigForm :key="`${scenario}-${mode}`" :schema="mergedSchema" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ASpace v-if="mode === 'editable'" style="margin-top: 16px"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { mergeSchema } from '@moluoxixi/schema'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Tag as ATag } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')

type ScenarioKey = 'individual' | 'enterprise' | 'student'
const scenario = ref<ScenarioKey>('individual')
const scenarioOptions = [{ label: '个人用户', value: 'individual' }, { label: '企业用户', value: 'enterprise' }, { label: '学生认证', value: 'student' }]

const BASE: FormSchema = { form: { labelPosition: 'right', labelWidth: '120px' }, fields: { name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', order: 1 }, phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }], order: 2 }, email: { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }], order: 3 }, remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', order: 99 } } }

const SCENARIOS: Record<ScenarioKey, { label: string; override: Partial<FormSchema> }> = {
  individual: { label: '个人用户', override: { fields: { idCard: { type: 'string', label: '身份证', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ pattern: /^\d{17}[\dXx]$/, message: '无效身份证' }], order: 4 }, city: { type: 'string', label: '城市', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }], order: 5 } } } },
  enterprise: { label: '企业用户', override: { fields: { name: { type: 'string', label: '联系人', required: true, component: 'Input', wrapper: 'FormItem', order: 1 }, companyName: { type: 'string', label: '公司名称', required: true, component: 'Input', wrapper: 'FormItem', order: 4 }, creditCode: { type: 'string', label: '信用代码', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位信用代码' }], order: 5 } } } },
  student: { label: '学生认证', override: { fields: { school: { type: 'string', label: '学校', required: true, component: 'Input', wrapper: 'FormItem', order: 4 }, studentId: { type: 'string', label: '学号', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ pattern: /^\d{8,14}$/, message: '8-14 位数字' }], order: 5 }, major: { type: 'string', label: '专业', required: true, component: 'Input', wrapper: 'FormItem', order: 6 } } } },
}

const mergedSchema = computed<FormSchema>(() => {
  const merged = mergeSchema(BASE, SCENARIOS[scenario.value].override)
  return { ...merged, form: { ...merged.form, pattern: mode.value } }
})
</script>
