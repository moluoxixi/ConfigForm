<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">图标网格选择 / 搜索过滤</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="menuName"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="icon"><AFormItem :label="field.label">
          <div style="margin-bottom: 8px">当前选中：<ATag v-if="field.value" color="blue">{{ field.value }}</ATag><span v-else style="color: #999">未选择</span></div>
          <div v-if="mode === 'editable'">
            <AInput v-model:value="search" placeholder="搜索图标名称" style="width: 300px; margin-bottom: 8px" allow-clear />
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 4px; max-height: 300px; overflow: auto; border: 1px solid #d9d9d9; border-radius: 6px; padding: 8px">
              <div v-for="name in filteredIcons" :key="name" @click="field.setValue(name)" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer', background: field.value === name ? '#e6f4ff' : 'transparent', border: field.value === name ? '1px solid #1677ff' : '1px solid transparent' }">
                <span style="font-size: 20px">{{ ICON_EMOJIS[name] || '📄' }}</span>
                <span style="font-size: 10px; margin-top: 4px; text-align: center">{{ name }}</span>
              </div>
            </div>
          </div>
        </AFormItem></FormField>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const search = ref('')
const ICON_LIST = ['Home', 'User', 'Setting', 'Search', 'Bell', 'Heart', 'Star', 'Check', 'Close', 'Info', 'Warning', 'Edit', 'Delete', 'Plus', 'Minus', 'Mail', 'Phone', 'Lock', 'Unlock', 'Cloud', 'Download', 'Upload', 'File', 'Folder', 'Copy', 'Share', 'Link', 'Team', 'Calendar', 'Clock']
const ICON_EMOJIS: Record<string, string> = { Home: '🏠', User: '👤', Setting: '⚙️', Search: '🔍', Bell: '🔔', Heart: '❤️', Star: '⭐', Check: '✅', Close: '❌', Info: 'ℹ️', Warning: '⚠️', Edit: '✏️', Delete: '🗑️', Plus: '➕', Minus: '➖', Mail: '📧', Phone: '📱', Lock: '🔒', Unlock: '🔓', Cloud: '☁️', Download: '⬇️', Upload: '⬆️', File: '📄', Folder: '📁', Copy: '📋', Share: '🔗', Link: '🔗', Team: '👥', Calendar: '📅', Clock: '🕐' }
const filteredIcons = computed(() => search.value ? ICON_LIST.filter(n => n.toLowerCase().includes(search.value.toLowerCase())) : ICON_LIST)
const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'Home' } })
watch(mode, (v) => { form.pattern = v })
onMounted(() => { form.createField({ name: 'menuName', label: '菜单名称', required: true }); form.createField({ name: 'icon', label: '图标', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
