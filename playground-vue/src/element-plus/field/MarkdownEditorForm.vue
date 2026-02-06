<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Markdown 编写 + 实时预览（可接入 md-editor-v3）</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="docTitle"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <FormField v-slot="{ field }" name="content"><el-form-item :label="field.label">
          <el-row v-if="mode === 'editable'" :gutter="16"><el-col :span="12"><div style="font-size: 12px; color: #999; margin-bottom: 4px">编辑区</div><el-input type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :rows="16" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }" /></el-col><el-col :span="12"><div style="font-size: 12px; color: #999; margin-bottom: 4px">预览区</div><div style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 12px; min-height: 380px; overflow: auto; background: #f5f7fa" v-html="simpleRender((field.value as string) ?? '')" /></el-col></el-row>
          <div v-else style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 16px; background: #f5f7fa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="simpleRender((field.value as string) ?? '')" />
        </el-form-item></FormField>
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
import { ElButton, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElRow, ElCol } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'
const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } })
onMounted(() => { form.createField({ name: 'docTitle', label: '文档标题', required: true }); form.createField({ name: 'content', label: 'Markdown', required: true }) })
function simpleRender(md: string): string { return md.replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>').replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/\n/g, '<br/>') }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
