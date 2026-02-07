<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      图标网格选择 / 搜索过滤
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="menuName">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="icon">
          <ElFormItem :label="field.label">
            <div style="margin-bottom: 8px">
              当前选中：<ElTag v-if="field.value" type="primary">
                {{ field.value }}
              </ElTag><span v-else style="color: #999">未选择</span>
            </div>
            <div v-if="mode === 'editable'">
              <ElInput v-model="search" placeholder="搜索图标名称" style="width: 300px; margin-bottom: 8px" clearable />
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 4px; max-height: 300px; overflow: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px">
                <div v-for="name in filteredIcons" :key="name" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer', background: field.value === name ? '#ecf5ff' : 'transparent', border: field.value === name ? '1px solid #409eff' : '1px solid transparent' }" @click="field.setValue(name)">
                  <span style="font-size: 20px">{{ ICON_EMOJIS[name] || '📄' }}</span>
                  <span style="font-size: 10px; margin-top: 4px; text-align: center">{{ name }}</span>
                </div>
              </div>
            </div>
          </ElFormItem>
        </FormField>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElTag } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const search = ref('')
const ICON_LIST = ['Home', 'User', 'Setting', 'Search', 'Bell', 'Heart', 'Star', 'Check', 'Close', 'Info', 'Warning', 'Edit', 'Delete', 'Plus', 'Minus', 'Mail', 'Phone', 'Lock', 'Unlock', 'Cloud', 'Download', 'Upload', 'File', 'Folder', 'Copy', 'Share', 'Link', 'Team', 'Calendar', 'Clock']
const ICON_EMOJIS: Record<string, string> = { Home: '🏠', User: '👤', Setting: '⚙️', Search: '🔍', Bell: '🔔', Heart: '❤️', Star: '⭐', Check: '✅', Close: '❌', Info: 'ℹ️', Warning: '⚠️', Edit: '✏️', Delete: '🗑️', Plus: '➕', Minus: '➖', Mail: '📧', Phone: '📱', Lock: '🔒', Unlock: '🔓', Cloud: '☁️', Download: '⬇️', Upload: '⬆️', File: '📄', Folder: '📁', Copy: '📋', Share: '🔗', Link: '🔗', Team: '👥', Calendar: '📅', Clock: '🕐' }
const filteredIcons = computed(() => search.value ? ICON_LIST.filter(n => n.toLowerCase().includes(search.value.toLowerCase())) : ICON_LIST)
const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'Home' } })
onMounted(() => {
  form.createField({ name: 'menuName', label: '菜单名称', required: true })
  form.createField({ name: 'icon', label: '图标', required: true })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
