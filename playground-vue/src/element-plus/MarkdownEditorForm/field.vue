<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Markdown 编写 + 实时预览（可接入 md-editor-v3）
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="docTitle">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="content">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <div style="display: flex; gap: 16px">
              <div style="flex: 1">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px">
                  编辑区
                </div>
                <textarea :value="(field.value as string) ?? ''" rows="16" :style="{ width: '100%', padding: '8px', border: '1px solid #dcdfe6', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
              </div>
              <div style="flex: 1">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px">
                  预览区
                </div>
                <div style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 12px; min-height: 380px; overflow: auto; background: #f5f7fa" v-html="simpleRender((field.value as string) ?? '')" />
              </div>
            </div>
            <div v-else style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 16px; background: #f5f7fa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="simpleRender((field.value as string) ?? '')" />
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
      </form>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'
const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } })
onMounted(() => {
  form.createField({ name: 'docTitle', label: '文档标题', required: true })
  form.createField({ name: 'content', label: 'Markdown', required: true })
})
function simpleRender(md: string): string {
  return md.replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>').replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/\n/g, '<br/>')
}
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
