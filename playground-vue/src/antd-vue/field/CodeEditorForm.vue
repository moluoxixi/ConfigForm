<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Textarea 模拟（可接入 monaco-editor-vue3）</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <ASpace style="margin-bottom: 16px"><FormField v-slot="{ field }" name="title"><AFormItem label="标题" style="margin-bottom: 0"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 250px" /></AFormItem></FormField><FormField v-slot="{ field }" name="language"><AFormItem label="语言" style="margin-bottom: 0"><ASelect :value="(field.value as string)" @change="(v: string) => field.setValue(v)" :options="[{label:'JavaScript',value:'javascript'},{label:'TypeScript',value:'typescript'},{label:'Python',value:'python'},{label:'JSON',value:'json'}]" :disabled="mode === 'disabled'" style="width: 160px" /></AFormItem></FormField></ASpace>
        <FormField v-slot="{ field }" name="code"><AFormItem :label="field.label"><ATextarea v-if="mode === 'editable'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :rows="12" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', background: '#1e1e1e', color: '#d4d4d4' }" /><pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '// 暂无代码' }}</pre></AFormItem></FormField>
        <AButton v-if="mode === 'editable'" type="primary" html-type="submit">提交</AButton>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, Select as ASelect, FormItem as AFormItem, Textarea as ATextarea } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '代码片段', language: 'javascript', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'language', label: '语言' }); form.createField({ name: 'code', label: '代码', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
