<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="title"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="content">
          <AFormItem :label="field.label" :required="field.required">
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #d9d9d9; border-radius: 6px; min-height: 100px; background: #fafafa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <ATextarea v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" />
          </AFormItem>
        </FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Input as AInput, FormItem as AFormItem, Textarea as ATextarea } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()
const form = useCreateForm({ initialValues: { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'content', label: '正文', required: true }) })
</script>
