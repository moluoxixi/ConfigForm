<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      format / parse / transform / submitPath
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="priceCent" :field-props="{ label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', component: 'TransformInput', format: formatPrice, parse: parsePrice, componentProps: { style: 'width: 300px' } }" />
          <FormField name="phoneRaw" :field-props="{ label: '手机号（脱敏）', component: 'TransformInput', format: formatPhone, componentProps: { style: 'width: 300px' } }" />
          <FormField name="fullName" :field-props="{ label: '姓名', component: 'TransformInput', componentProps: { style: 'width: 300px' } }" />
          <FormField name="tags" :field-props="{ label: '标签（逗号分隔）', description: '提交时转为数组', component: 'TransformInput', transform: transformTags, componentProps: { style: 'width: 300px' } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

setupElementPlus()

// ========== 数据转换函数 ==========

/**
 * 价格格式化：分 → 元
 *
 * @param v - 原始值（分）
 * @returns 格式化后的元字符串
 */
function formatPrice(v: unknown): string {
  return v ? (Number(v) / 100).toFixed(2) : ''
}

/**
 * 价格解析：元 → 分
 *
 * @param v - 输入值（元）
 * @returns 分值
 */
function parsePrice(v: unknown): number {
  return Math.round(Number(v) * 100)
}

/**
 * 手机号脱敏格式化
 *
 * @param v - 原始手机号
 * @returns 脱敏后的手机号
 */
function formatPhone(v: unknown): string {
  const s = String(v ?? '')
  return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s
}

/**
 * 标签转换：逗号字符串 → 数组
 *
 * @param v - 逗号分隔的标签字符串
 * @returns 标签数组
 */
function transformTags(v: unknown): string[] {
  return String(v ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

// ========== 自定义组件：数据转换输入 ==========

/**
 * 数据转换输入组件
 *
 * 在标准 Input 旁边展示一个调试 Tag，显示当前字段值的 JSON 表示
 * 用于演示 format / parse / transform 的实际效果
 */
const TransformInput = defineComponent({
  name: 'TransformInput',
  props: {
    value: { type: [String, Number] as PropType<string | number>, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    style: { type: [String, Object] as PropType<string | Record<string, string>>, default: undefined },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      /* 调试 Tag：展示当前值的 JSON 表示 */
      const debugTag = h('span', {
        style: {
          display: 'inline-block',
          padding: '0 7px',
          fontSize: '12px',
          lineHeight: '20px',
          background: '#e6f4ff',
          border: '1px solid #91caff',
          borderRadius: '4px',
          color: '#1677ff',
          marginLeft: '8px',
          whiteSpace: 'nowrap',
        },
      }, `原始: ${JSON.stringify(props.value)}`)

      /* 只读态：文本 + 调试 Tag */
      if (props.readOnly) {
        return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
          h('span', {}, String(props.value ?? '') || '—'),
          debugTag,
        ])
      }

      /* 编辑态 / 禁用态：Input + 调试 Tag */
      return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
        h('input', {
          type: 'text',
          value: String(props.value ?? ''),
          disabled: props.disabled,
          style: {
            ...(typeof props.style === 'string'
              ? { width: props.style.match(/width:\s*([^;]+)/)?.[1] ?? '300px' }
              : (props.style ?? {})),
            padding: '4px 11px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
          },
          onInput: (e: Event) => props.onChange?.((e.target as HTMLInputElement).value),
        }),
        debugTag,
      ])
    }
  },
})

registerComponent('TransformInput', TransformInput, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    priceCent: 9990,
    phoneRaw: '13800138000',
    fullName: '张三',
    tags: 'react,vue,typescript',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
