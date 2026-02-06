<template>
  <div>
    <h2>颜色选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">原生 color input + 预设色板 / HEX 输入</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="themeName"><AFormItem :label="field.label"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <FormField v-for="cn in colorNames" :key="cn" v-slot="{ field }" :name="cn">
          <AFormItem :label="field.label">
            <ASpace v-if="mode !== 'editable'"><div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" /><code>{{ field.value }}</code></ASpace>
            <div v-else>
              <ASpace style="margin-bottom: 8px"><input type="color" :value="(field.value as string) ?? '#000'" @input="field.setValue(($event.target as HTMLInputElement).value)" style="width: 48px; height: 48px; border: none; cursor: pointer; padding: 0" /><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" style="width: 120px" /><div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" /></ASpace>
              <div style="display: flex; gap: 4px">
                <div v-for="c in PRESETS" :key="c" @click="field.setValue(c)" :style="{ width: '24px', height: '24px', background: c, borderRadius: '4px', cursor: 'pointer', border: field.value === c ? '2px solid #333' : '1px solid #d9d9d9' }" />
              </div>
            </div>
          </AFormItem>
        </FormField>
        <div :style="{ padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #eee', background: (form.getFieldValue('bgColor') as string) || '#fff', color: (form.getFieldValue('textColor') as string) || '#333' }">
          <h4 :style="{ color: (form.getFieldValue('primaryColor') as string) || '#1677ff' }">主题预览</h4>
          <p>文字颜色预览</p>
          <button :style="{ background: (form.getFieldValue('primaryColor') as string) || '#1677ff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px' }">主色调按钮</button>
        </div>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']
const colorNames = ['primaryColor', 'bgColor', 'textColor']

const form = useCreateForm({ initialValues: { themeName: '自定义主题', primaryColor: '#1677ff', bgColor: '#ffffff', textColor: '#333333' } })
onMounted(() => { form.createField({ name: 'themeName', label: '主题名称', required: true }); form.createField({ name: 'primaryColor', label: '主色调', required: true }); form.createField({ name: 'bgColor', label: '背景色' }); form.createField({ name: 'textColor', label: '文字颜色' }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
