<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="title"><el-form-item :label="field.label" :required="field.required"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" /></el-form-item></FormField>
        <FormField v-slot="{ field }" name="content">
          <el-form-item :label="field.label" :required="field.required">
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #dcdfe6; border-radius: 4px; min-height: 100px; background: #f5f7fa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <el-input v-else type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" />
          </el-form-item>
        </FormField>
        <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }); form.createField({ name: 'content', label: '正文', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
