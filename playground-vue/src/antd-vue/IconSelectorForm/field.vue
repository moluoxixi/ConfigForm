<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      图标网格选择 / 搜索过滤
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="menuName">
          <AFormItem :label="field.label">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="icon">
          <AFormItem :label="field.label">
            <div style="margin-bottom: 8px">
              当前选中：<ATag v-if="field.value" color="blue">
                {{ field.value }}
              </ATag><span v-else style="color: #999">未选择</span>
            </div>
            <div v-if="mode === 'editable'">
              <AInput v-model:value="search" placeholder="搜索图标名称" style="width: 300px; margin-bottom: 8px" allow-clear />
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 4px; max-height: 300px; overflow: auto; border: 1px solid #d9d9d9; border-radius: 6px; padding: 8px">
                <div v-for="name in filteredIcons" :key="name" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer', background: field.value === name ? '#e6f4ff' : 'transparent', border: field.value === name ? '1px solid #1677ff' : '1px solid transparent' }" @click="field.setValue(name)">
                  <span style="font-size: 20px">{{ ICON_EMOJIS[name] || '📄' }}</span>
                  <span style="font-size: 10px; margin-top: 4px; text-align: center">{{ name }}</span>
                </div>
              </div>
            </div>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { FormItem as AFormItem, Input as AInput, Tag as ATag } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const search = ref('')
const ICON_LIST = ['Home', 'User', 'Setting', 'Search', 'Bell', 'Heart', 'Star', 'Check', 'Close', 'Info', 'Warning', 'Edit', 'Delete', 'Plus', 'Minus', 'Mail', 'Phone', 'Lock', 'Unlock', 'Cloud', 'Download', 'Upload', 'File', 'Folder', 'Copy', 'Share', 'Link', 'Team', 'Calendar', 'Clock']
const ICON_EMOJIS: Record<string, string> = { Home: '🏠', User: '👤', Setting: '⚙️', Search: '🔍', Bell: '🔔', Heart: '❤️', Star: '⭐', Check: '✅', Close: '❌', Info: 'ℹ️', Warning: '⚠️', Edit: '✏️', Delete: '🗑️', Plus: '➕', Minus: '➖', Mail: '📧', Phone: '📱', Lock: '🔒', Unlock: '🔓', Cloud: '☁️', Download: '⬇️', Upload: '⬆️', File: '📄', Folder: '📁', Copy: '📋', Share: '🔗', Link: '🔗', Team: '👥', Calendar: '📅', Clock: '🕐' }
const filteredIcons = computed(() => search.value ? ICON_LIST.filter(n => n.toLowerCase().includes(search.value.toLowerCase())) : ICON_LIST)
const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'Home' } })

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}

onMounted(() => {
  form.createField({ name: 'menuName', label: '菜单名称', required: true })
  form.createField({ name: 'icon', label: '图标', required: true })
})
</script>
