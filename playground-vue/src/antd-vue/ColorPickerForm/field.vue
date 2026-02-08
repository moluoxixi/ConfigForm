<template>
  <div>
    <h2>颜色选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      原生 color input + 预设色板 / HEX 输入
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="themeName" :field-props="{ label: '主题名称', required: true, component: 'Input', componentProps: { placeholder: '请输入主题名称' } }" />
          <FormField name="primaryColor" :field-props="{ label: '主色调', required: true, component: 'ColorEditor', componentProps: { presets: PRESETS } }" />
          <FormField name="bgColor" :field-props="{ label: '背景色', component: 'ColorEditor', componentProps: { presets: PRESETS } }" />
          <FormField name="textColor" :field-props="{ label: '文字颜色', component: 'ColorEditor', componentProps: { presets: PRESETS } }" />
          <!-- 主题预览区域 -->
          <div :style="{ padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #eee', background: (form.getFieldValue('bgColor') as string) || '#fff', color: (form.getFieldValue('textColor') as string) || '#333' }">
            <h4 :style="{ color: (form.getFieldValue('primaryColor') as string) || '#1677ff' }">
              主题预览
            </h4>
            <p>文字颜色预览</p>
            <button :style="{ background: (form.getFieldValue('primaryColor') as string) || '#1677ff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px' }">
              主色调按钮
            </button>
          </div>
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
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== 自定义组件：颜色编辑器 ==========

/**
 * 颜色编辑器组件
 *
 * - 编辑态：原生 color input + HEX 输入 + 色块预览 + 预设色板
 * - 禁用态：同编辑态但不可交互
 * - 只读态：色块 + HEX 值展示
 */
const ColorEditor = defineComponent({
  name: 'ColorEditor',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    presets: { type: Array as PropType<string[]>, default: () => [] },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      /* 只读态：色块 + HEX 值 */
      if (props.readOnly) {
        return h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, [
          h('div', {
            style: {
              width: '32px',
              height: '32px',
              background: props.value || '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            },
          }),
          h('code', {}, props.value),
        ])
      }

      /* 编辑态 / 禁用态 */
      const cursorStyle = props.disabled ? 'not-allowed' : 'pointer'

      const children = [
        /* 颜色输入行：拾色器 + HEX 输入 + 色块预览 */
        h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' } }, [
          h('input', {
            type: 'color',
            value: props.value ?? '#000',
            disabled: props.disabled,
            style: { width: '48px', height: '48px', border: 'none', cursor: cursorStyle, padding: '0' },
            onInput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value),
          }),
          h('input', {
            type: 'text',
            value: props.value ?? '',
            disabled: props.disabled,
            style: {
              width: '120px',
              padding: '4px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            },
            onInput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value),
          }),
          h('div', {
            style: {
              width: '32px',
              height: '32px',
              background: props.value || '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            },
          }),
        ]),
      ]

      /* 预设色板 */
      if (props.presets.length > 0) {
        children.push(
          h('div', { style: { display: 'flex', gap: '4px' } },
            props.presets.map(c =>
              h('div', {
                key: c,
                style: {
                  width: '24px',
                  height: '24px',
                  background: c,
                  borderRadius: '4px',
                  cursor: cursorStyle,
                  border: props.value === c ? '2px solid #333' : '1px solid #d9d9d9',
                },
                onClick: () => !props.disabled && props.onChange?.(c),
              }),
            ),
          ),
        )
      }

      return h('div', {}, children)
    }
  },
})

registerComponent('ColorEditor', ColorEditor, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

/** 预设色板 */
const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']

const form = useCreateForm({
  initialValues: {
    themeName: '自定义主题',
    primaryColor: '#1677ff',
    bgColor: '#ffffff',
    textColor: '#333333',
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
