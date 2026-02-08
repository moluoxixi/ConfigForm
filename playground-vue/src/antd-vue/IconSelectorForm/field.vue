<template>
  <div>
    <h2>图标选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      图标网格选择 / 搜索过滤
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="menuName" :field-props="{ label: '菜单名称', required: true, component: 'Input', componentProps: { placeholder: '请输入菜单名称', style: 'width: 300px' } }" />
          <FormField name="icon" :field-props="{ label: '图标', required: true, component: 'IconSelector' }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { computed, defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== 图标数据 ==========

/** 可选图标列表 */
const ICON_LIST = [
  'Home', 'User', 'Setting', 'Search', 'Bell', 'Heart', 'Star', 'Check',
  'Close', 'Info', 'Warning', 'Edit', 'Delete', 'Plus', 'Minus', 'Mail',
  'Phone', 'Lock', 'Unlock', 'Cloud', 'Download', 'Upload', 'File', 'Folder',
  'Copy', 'Share', 'Link', 'Team', 'Calendar', 'Clock',
]

/** 图标 → emoji 映射 */
const ICON_EMOJIS: Record<string, string> = {
  Home: '🏠', User: '👤', Setting: '⚙️', Search: '🔍', Bell: '🔔', Heart: '❤️',
  Star: '⭐', Check: '✅', Close: '❌', Info: 'ℹ️', Warning: '⚠️', Edit: '✏️',
  Delete: '🗑️', Plus: '➕', Minus: '➖', Mail: '📧', Phone: '📱', Lock: '🔒',
  Unlock: '🔓', Cloud: '☁️', Download: '⬇️', Upload: '⬆️', File: '📄', Folder: '📁',
  Copy: '📋', Share: '🔗', Link: '🔗', Team: '👥', Calendar: '📅', Clock: '🕐',
}

// ========== 自定义组件：图标选择器 ==========

/**
 * 图标选择器组件
 *
 * - 编辑态：搜索栏 + 图标网格，点击选中
 * - 只读/禁用态：仅展示当前选中图标
 */
const IconSelector = defineComponent({
  name: 'IconSelector',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    /** 搜索关键词 */
    const search = ref('')

    /** 过滤后的图标列表 */
    const filteredIcons = computed(() =>
      search.value
        ? ICON_LIST.filter(n => n.toLowerCase().includes(search.value.toLowerCase()))
        : ICON_LIST,
    )

    return (): ReturnType<typeof h> => {
      /* 当前选中展示 */
      const selectedDisplay = h('div', { style: { marginBottom: '8px' } }, [
        '当前选中：',
        props.value
          ? h('span', {
            style: {
              display: 'inline-block',
              padding: '0 7px',
              fontSize: '12px',
              lineHeight: '20px',
              background: '#e6f4ff',
              border: '1px solid #91caff',
              borderRadius: '4px',
              color: '#1677ff',
            },
          }, `${ICON_EMOJIS[props.value] ?? '📄'} ${props.value}`)
          : h('span', { style: { color: '#999' } }, '未选择'),
      ])

      /* 只读/禁用态：仅展示选中 */
      if (props.readOnly || props.disabled) {
        return h('div', {}, [selectedDisplay])
      }

      /* 编辑态：搜索 + 图标网格 */
      return h('div', {}, [
        selectedDisplay,
        /* 搜索框 */
        h('input', {
          value: search.value,
          placeholder: '搜索图标名称',
          style: {
            width: '300px',
            marginBottom: '8px',
            padding: '4px 11px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            display: 'block',
          },
          onInput: (e: Event) => { search.value = (e.target as HTMLInputElement).value },
        }),
        /* 图标网格 */
        h('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '4px',
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '8px',
          },
        },
        filteredIcons.value.map(name =>
          h('div', {
            key: name,
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: props.value === name ? '#e6f4ff' : 'transparent',
              border: props.value === name ? '1px solid #1677ff' : '1px solid transparent',
            },
            onClick: () => props.onChange?.(name),
          }, [
            h('span', { style: { fontSize: '20px' } }, ICON_EMOJIS[name] ?? '📄'),
            h('span', { style: { fontSize: '10px', marginTop: '4px', textAlign: 'center' } }, name),
          ]),
        )),
      ])
    }
  },
})

registerComponent('IconSelector', IconSelector, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    menuName: '首页',
    icon: 'Home',
  },
})

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
</script>
