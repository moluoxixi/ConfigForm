<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">format / parse / transform / submitPath</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-for="name in FIELDS" :key="name" v-slot="{ field }" :name="name"><AFormItem :label="field.label" :help="field.description"><ASpace><AInput :value="String(field.value ?? '')" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /><ATag color="blue">原始: {{ JSON.stringify(field.value) }}</ATag></ASpace></AFormItem></FormField>
        <ASpace v-if="mode === 'editable'" style="margin-top: 8px"><AButton type="primary" html-type="submit">提交（查看转换结果）</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="rawValues" type="info" message="表单原始值" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ rawValues }}</pre></template></AAlert>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交转换后" style="margin-top: 8px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const rawValues = ref('')
const FIELDS = ['priceCent', 'phoneRaw', 'fullName', 'tags']
const form = useCreateForm({ initialValues: { priceCent: 9990, phoneRaw: '13800138000', fullName: '张三', tags: 'react,vue,typescript' } })
onMounted(() => {
  form.createField({ name: 'priceCent', label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '', parse: (v: unknown) => Math.round(Number(v) * 100) })
  form.createField({ name: 'phoneRaw', label: '手机号（脱敏）', format: (v: unknown) => { const s = String(v ?? ''); return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s } })
  form.createField({ name: 'fullName', label: '姓名' })
  form.createField({ name: 'tags', label: '标签（逗号分隔）', description: '提交时转为数组', transform: (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean) })
})
async function handleSubmit(): Promise<void> { rawValues.value = JSON.stringify(form.values, null, 2); const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
