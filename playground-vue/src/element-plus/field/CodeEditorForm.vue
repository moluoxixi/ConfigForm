<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Textarea 模拟（可接入 monaco-editor-vue3）</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <el-space style="margin-bottom: 16px"><FormField v-slot="{ field }" name="title"><el-form-item label="标题" style="margin-bottom: 0"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 250px" /></el-form-item></FormField><FormField v-slot="{ field }" name="language"><el-form-item label="语言" style="margin-bottom: 0"><el-select :model-value="(field.value as string)" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 160px"><el-option v-for="opt in [{label:'JavaScript',value:'javascript'},{label:'TypeScript',value:'typescript'},{label:'Python',value:'python'},{label:'JSON',value:'json'}]" :key="opt.value" :label="opt.label" :value="opt.value" /></el-select></el-form-item></FormField></el-space>
        <FormField v-slot="{ field }" name="code"><el-form-item :label="field.label"><el-input v-if="mode === 'editable'" type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :rows="12" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', background: '#1e1e1e', color: '#d4d4d4' }" /><pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '// 暂无代码' }}</pre></el-form-item></FormField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElSelect, ElOption, ElFormItem } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '代码片段', language: 'javascript', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'language', label: '语言' }); form.createField({ name: 'code', label: '代码', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
