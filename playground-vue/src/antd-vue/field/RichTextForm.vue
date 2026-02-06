<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="title"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="content">
          <AFormItem :label="field.label" :required="field.required">
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #d9d9d9; border-radius: 6px; min-height: 100px; background: #fafafa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <ATextarea v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" />
          </AFormItem>
        </FormField>
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
import { Button as AButton, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Textarea as ATextarea } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'content', label: '正文', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
