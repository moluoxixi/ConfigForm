<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Textarea 模拟（可接入 monaco-editor-vue3）
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ASpace style="margin-bottom: 16px">
          <FormField v-slot="{ field }" name="title">
            <AFormItem label="标题" style="margin-bottom: 0">
              <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 250px" @update:value="field.setValue($event)" />
            </AFormItem>
          </FormField><FormField v-slot="{ field }" name="language">
            <AFormItem label="语言" style="margin-bottom: 0">
              <ASelect :value="(field.value as string)" :options="[{ label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' }, { label: 'Python', value: 'python' }, { label: 'JSON', value: 'json' }]" :disabled="mode === 'disabled'" style="width: 160px" @change="(v: string) => field.setValue(v)" />
            </AFormItem>
          </FormField>
        </ASpace>
        <FormField v-slot="{ field }" name="code">
          <AFormItem :label="field.label">
            <ATextarea v-if="mode === 'editable'" :value="(field.value as string) ?? ''" :rows="12" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', background: '#1e1e1e', color: '#d4d4d4' }" @update:value="field.setValue($event)" /><pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '// 暂无代码' }}</pre>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { FormItem as AFormItem, Input as AInput, Select as ASelect, Space as ASpace, Textarea as ATextarea } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({ initialValues: { title: '代码片段', language: 'javascript', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));' } })

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

onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'language', label: '语言' })
  form.createField({ name: 'code', label: '代码', required: true })
})
</script>
