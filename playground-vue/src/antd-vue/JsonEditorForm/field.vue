<template>
  <div>
    <h2>JSON 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">JSON 编辑 + 格式化 + 实时语法检查</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="configName"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="jsonContent">
          <AFormItem :label="field.label">
            <ASpace v-if="mode === 'editable'" style="margin-bottom: 8px"><AButton size="small" @click="formatJson(field)">格式化</AButton><AButton size="small" @click="minifyJson(field)">压缩</AButton><ATag :color="jsonError ? 'error' : 'success'">{{ jsonError ? '语法错误' : '合法 JSON' }}</ATag></ASpace>
            <ATextarea v-if="mode === 'editable'" :value="(field.value as string) ?? ''" @update:value="handleJsonChange(field, $event)" :rows="14" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }" />
            <pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#f6f8fa', fontSize: '13px', fontFamily: 'Consolas, Monaco, monospace', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '{}' }}</pre>
            <div v-if="jsonError" style="color: #ff4d4f; font-size: 12px; margin-top: 4px">{{ jsonError }}</div>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, FormItem as AFormItem, Textarea as ATextarea, Tag as ATag } from 'ant-design-vue'
import type { FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const jsonError = ref<string | null>(null)
const form = useCreateForm({ initialValues: { configName: 'API 配置', jsonContent: JSON.stringify({ name: '张三', age: 28, roles: ['admin'] }, null, 2) } })

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}

onMounted(() => { form.createField({ name: 'configName', label: '配置名称', required: true }); form.createField({ name: 'jsonContent', label: 'JSON 内容', required: true }) })
function handleJsonChange(field: FieldInstance, value: string): void { field.setValue(value); try { JSON.parse(value); jsonError.value = null } catch (e) { jsonError.value = (e as Error).message } }
function formatJson(field: FieldInstance): void { try { field.setValue(JSON.stringify(JSON.parse(field.value as string), null, 2)); jsonError.value = null } catch { /* */ } }
function minifyJson(field: FieldInstance): void { try { field.setValue(JSON.stringify(JSON.parse(field.value as string))); jsonError.value = null } catch { /* */ } }
</script>
