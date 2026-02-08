<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">图标网格选择 / 搜索过滤 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 图标选择器 — Config 模式
 *
 * 自定义 IconSelector 组件注册后，在 schema 中通过 component: 'IconSelector' 引用。
 */
import { computed, defineComponent, h, ref } from 'vue'

setupElementPlus()

/** 图标列表 */
const ICON_LIST = ['Home', 'User', 'Setting', 'Search', 'Bell', 'Heart', 'Star', 'Check', 'Close', 'Info', 'Warning', 'Edit', 'Delete', 'Plus', 'Minus', 'Mail', 'Phone', 'Lock', 'Unlock', 'Cloud', 'Download', 'Upload', 'File', 'Folder', 'Copy', 'Share', 'Link', 'Team', 'Calendar', 'Clock']
const ICON_EMOJIS: Record<string, string> = { Home: '🏠', User: '👤', Setting: '⚙️', Search: '🔍', Bell: '🔔', Heart: '❤️', Star: '⭐', Check: '✅', Close: '❌', Info: 'ℹ️', Warning: '⚠️', Edit: '✏️', Delete: '🗑️', Plus: '➕', Minus: '➖', Mail: '📧', Phone: '📱', Lock: '🔒', Unlock: '🔓', Cloud: '☁️', Download: '⬇️', Upload: '⬆️', File: '📄', Folder: '📁', Copy: '📋', Share: '🔗', Link: '🔗', Team: '👥', Calendar: '📅', Clock: '🕐' }

/** 图标选择器组件 */
const IconSelector = defineComponent({
  name: 'IconSelector',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    const search = ref('')
    const filteredIcons = computed(() => search.value ? ICON_LIST.filter(n => n.toLowerCase().includes(search.value.toLowerCase())) : ICON_LIST)
    return (): ReturnType<typeof h> => {
      const selectedDisplay = h('div', { style: { marginBottom: '8px' } }, ['当前选中：', props.value ? h('span', { style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', background: '#e6f4ff', border: '1px solid #91caff', borderRadius: '4px', color: '#1677ff' } }, `${ICON_EMOJIS[props.value] ?? '📄'} ${props.value}`) : h('span', { style: { color: '#999' } }, '未选择')])
      if (props.readOnly || props.disabled) return h('div', {}, [selectedDisplay])
      return h('div', {}, [
        selectedDisplay,
        h('input', { value: search.value, placeholder: '搜索图标名称', style: { width: '300px', marginBottom: '8px', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '14px', outline: 'none', display: 'block' }, onInput: (e: Event) => { search.value = (e.target as HTMLInputElement).value } }),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '4px', maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '8px' } }, filteredIcons.value.map(name => h('div', { key: name, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer', background: props.value === name ? '#e6f4ff' : 'transparent', border: props.value === name ? '1px solid #1677ff' : '1px solid transparent' }, onClick: () => props.onChange?.(name) }, [h('span', { style: { fontSize: '20px' } }, ICON_EMOJIS[name] ?? '📄'), h('span', { style: { fontSize: '10px', marginTop: '4px', textAlign: 'center' } }, name)]))),
      ])
    }
  },
})

registerComponent('IconSelector', IconSelector, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { menuName: '首页', icon: 'Home' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    menuName: { type: 'string', title: '菜单名称', required: true, componentProps: { placeholder: '请输入菜单名称', style: 'width: 300px' } },
    icon: { type: 'string', title: '图标', required: true, component: 'IconSelector' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
