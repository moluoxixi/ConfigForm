<template>
  <div>
    <h2>JSON 编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      JSON 编辑 + 格式化 + 实时语法检查
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
        <FormField v-slot="{ field }" name="configName">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="jsonContent">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center">
              <button type="button" style="padding: 4px 12px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 12px" @click="formatJson(field)">
                格式化
              </button>
              <button type="button" style="padding: 4px 12px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 12px" @click="minifyJson(field)">
                压缩
              </button>
              <span :style="{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: jsonError ? '#fef0f0' : '#f0f9eb', color: jsonError ? '#f56c6c' : '#67c23a', border: jsonError ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
                {{ jsonError ? '语法错误' : '合法 JSON' }}
              </span>
            </div>
            <textarea :value="(field.value as string) ?? ''" rows="14" :style="{ width: '100%', padding: '8px', border: '1px solid #dcdfe6', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }" @input="handleJsonChange(field, ($event.target as HTMLTextAreaElement).value)" />
            <pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#f6f8fa', fontSize: '13px', fontFamily: 'Consolas, Monaco, monospace', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '{}' }}</pre>
            <div v-if="jsonError" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
              {{ jsonError }}
            </div>
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const jsonError = ref<string | null>(null)
const form = useCreateForm({ initialValues: { configName: 'API 配置', jsonContent: JSON.stringify({ name: '张三', age: 28, roles: ['admin'] }, null, 2) } })
onMounted(() => {
  form.createField({ name: 'configName', label: '配置名称', required: true })
  form.createField({ name: 'jsonContent', label: 'JSON 内容', required: true })
})
function handleJsonChange(field: FieldInstance, value: string): void {
  field.setValue(value)
  try {
    JSON.parse(value)
    jsonError.value = null
  }
  catch (e) { jsonError.value = (e as Error).message }
}
function formatJson(field: FieldInstance): void {
  try {
    field.setValue(JSON.stringify(JSON.parse(field.value as string), null, 2))
    jsonError.value = null
  }
  catch { /* */ }
}
function minifyJson(field: FieldInstance): void {
  try {
    field.setValue(JSON.stringify(JSON.parse(field.value as string)))
    jsonError.value = null
  }
  catch { /* */ }
}
</script>
