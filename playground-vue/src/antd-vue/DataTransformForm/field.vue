<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">format / parse / transform / submitPath</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-for="name in FIELDS" :key="name" v-slot="{ field }" :name="name"><AFormItem :label="field.label" :help="field.description"><ASpace><span v-if="mode === 'readOnly'">{{ String(field.value ?? '') || '—' }}</span><AInput v-else :value="String(field.value ?? '')" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /><ATag color="blue">原始: {{ JSON.stringify(field.value) }}</ATag></ASpace></AFormItem></FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Space as ASpace, Input as AInput, FormItem as AFormItem, Tag as ATag } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const FIELDS = ['priceCent', 'phoneRaw', 'fullName', 'tags']
const form = useCreateForm({ initialValues: { priceCent: 9990, phoneRaw: '13800138000', fullName: '张三', tags: 'react,vue,typescript' } })
onMounted(() => {
  form.createField({ name: 'priceCent', label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '', parse: (v: unknown) => Math.round(Number(v) * 100) })
  form.createField({ name: 'phoneRaw', label: '手机号（脱敏）', format: (v: unknown) => { const s = String(v ?? ''); return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s } })
  form.createField({ name: 'fullName', label: '姓名' })
  form.createField({ name: 'tags', label: '标签（逗号分隔）', description: '提交时转为数组', transform: (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean) })
})
</script>
