<template>
  <div>
    <h2>JSON 编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      JSON 编辑 + 格式化 + 实时语法检查
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="configName">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="jsonContent">
          <ElFormItem :label="field.label">
            <ElSpace v-if="mode === 'editable'" style="margin-bottom: 8px">
              <ElButton size="small" @click="formatJson(field)">
                格式化
              </ElButton><ElButton size="small" @click="minifyJson(field)">
                压缩
              </ElButton><ElTag :type="jsonError ? 'danger' : 'success'">
                {{ jsonError ? '语法错误' : '合法 JSON' }}
              </ElTag>
            </ElSpace>
            <ElInput v-if="mode === 'editable'" type="textarea" :model-value="(field.value as string) ?? ''" :rows="14" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }" @update:model-value="handleJsonChange(field, $event)" />
            <pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#f6f8fa', fontSize: '13px', fontFamily: 'Consolas, Monaco, monospace', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '{}' }}</pre>
            <div v-if="jsonError" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
              {{ jsonError }}
            </div>
          </ElFormItem>
        </FormField>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElTag } from 'element-plus'
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
async function handleSubmit(): Promise<void> {
  if (jsonError.value) {
    result.value = '验证失败: JSON 格式错误'
    return
  }
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
