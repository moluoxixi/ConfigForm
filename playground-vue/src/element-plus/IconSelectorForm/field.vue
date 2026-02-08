<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      图标网格选择 / 搜索过滤
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="menuName">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="icon">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <div style="margin-bottom: 8px">
              当前选中：<span v-if="field.value" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff">{{ field.value }}</span><span v-else style="color: #999">未选择</span>
            </div>
            <div>
              <input v-model="search" placeholder="搜索图标名称" style="width: 300px; margin-bottom: 8px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" />
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 4px; max-height: 300px; overflow: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px">
                <div v-for="name in filteredIcons" :key="name" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer', background: field.value === name ? '#ecf5ff' : 'transparent', border: field.value === name ? '1px solid #409eff' : '1px solid transparent' }" @click="field.setValue(name)">
                  <span style="font-size: 20px">{{ ICON_EMOJIS[name] || '📄' }}</span>
                  <span style="font-size: 10px; margin-top: 4px; text-align: center">{{ name }}</span>
                </div>
              </div>
            </div>
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
      </form>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
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
