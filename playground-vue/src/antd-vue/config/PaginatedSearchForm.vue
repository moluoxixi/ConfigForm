<template>
  <div>
    <h2>分页搜索数据源</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">大数据量远程搜索 / 分页加载 / 搜索防抖</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="userId">
          <AFormItem label="选择用户" :required="field.required">
            <ASelect :value="(field.value as string)" show-search :filter-option="false" @search="handleSearch" @change="(v: string) => field.setValue(v)" :options="options" :loading="loading" :disabled="mode === 'disabled'" style="width: 400px" placeholder="输入关键词搜索（共 1000 条模拟数据）" />
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
import { Button as AButton, Alert as AAlert, Segmented as ASegmented, FormItem as AFormItem, Select as ASelect } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const options = ref<Array<{ label: string; value: string }>>([])
const loading = ref(false)

const MOCK = Array.from({ length: 1000 }, (_, i) => ({ id: `user-${i + 1}`, name: `用户${String(i + 1).padStart(4, '0')}`, dept: ['技术', '产品', '设计', '运营'][i % 4] }))

const form = useCreateForm({ initialValues: { userId: undefined } })
onMounted(() => { form.createField({ name: 'userId', label: '选择用户', required: true }); loadData('') })

let timer: ReturnType<typeof setTimeout> | null = null
function handleSearch(kw: string): void { if (timer) clearTimeout(timer); timer = setTimeout(() => loadData(kw), 300) }
async function loadData(kw: string): Promise<void> { loading.value = true; await new Promise(r => setTimeout(r, 400)); const filtered = kw ? MOCK.filter(u => u.name.includes(kw) || u.dept.includes(kw)) : MOCK; options.value = filtered.slice(0, 50).map(u => ({ label: `${u.name}（${u.dept}）`, value: u.id })); loading.value = false }

async function handleSubmit(): Promise<void> { const res = await form.submit(); if (res.errors.length > 0) { result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { result.value = JSON.stringify(res.values, null, 2) } }
</script>
