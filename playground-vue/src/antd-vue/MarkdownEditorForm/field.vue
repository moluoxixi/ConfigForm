<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Markdown 编写 + 实时预览（可接入 md-editor-v3）
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="docTitle">
          <AFormItem :label="field.label">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="content">
          <AFormItem :label="field.label">
            <ARow v-if="mode === 'editable'" :gutter="16">
              <ACol :span="12">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px">
                  编辑区
                </div><ATextarea :value="(field.value as string) ?? ''" :rows="16" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }" @update:value="field.setValue($event)" />
              </ACol><ACol :span="12">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px">
                  预览区
                </div><div style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 12px; min-height: 380px; overflow: auto; background: #fafafa" v-html="simpleRender((field.value as string) ?? '')" />
              </ACol>
            </ARow>
            <div v-else style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 16px; background: #fafafa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="simpleRender((field.value as string) ?? '')" />
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
import { Col as ACol, FormItem as AFormItem, Input as AInput, Row as ARow, Textarea as ATextarea } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'
const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } })
onMounted(() => {
  form.createField({ name: 'docTitle', label: '文档标题', required: true })
  form.createField({ name: 'content', label: 'Markdown', required: true })
})
function simpleRender(md: string): string {
  return md.replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>').replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/\n/g, '<br/>')
}
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
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
