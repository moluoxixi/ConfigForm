<template>
  <div>
    <h2>值联动</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      单向同步 / 格式转换 / 映射转换 / 多对一聚合 — ConfigForm + ISchema 实现
    </p>
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
/**
 * 值联动 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现值联动：
 * - 单向同步（姓 + 名 → 全名）
 * - 格式转换（大写、去空格）
 * - 映射转换（国家 → 区号、货币）
 * - 多对一聚合（省市区 → 完整地址）
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const COUNTRY_CODE: Record<string, string> = { china: '+86', usa: '+1', japan: '+81', korea: '+82', uk: '+44' }
const COUNTRY_CURRENCY: Record<string, string> = { china: 'CNY', usa: 'USD', japan: 'JPY', korea: 'KRW', uk: 'GBP' }

const initialValues = {
  firstName: '', lastName: '', fullName: '',
  rawInput: '', upperCase: '', trimmed: '',
  country: 'china', areaCode: '+86', currency: 'CNY',
  province: '', city: '', district: '', fullAddress: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    firstName: { type: 'string', title: '姓', componentProps: { placeholder: '请输入姓' } },
    lastName: { type: 'string', title: '名', componentProps: { placeholder: '请输入名' } },
    fullName: {
      type: 'string', title: '全名（自动拼接）', componentProps: { disabled: true },
      reactions: [{ watch: ['firstName', 'lastName'], fulfill: { run: (f: any, ctx: any) => {
        f.setValue(`${(ctx.values.firstName as string) ?? ''}${(ctx.values.lastName as string) ?? ''}`.trim())
      } } }],
    },
    rawInput: { type: 'string', title: '输入文本', componentProps: { placeholder: '输入任意文本' } },
    upperCase: {
      type: 'string', title: '大写转换', componentProps: { disabled: true },
      reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').toUpperCase()) } } }],
    },
    trimmed: {
      type: 'string', title: '去空格', componentProps: { disabled: true },
      reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').trim()) } } }],
    },
    country: {
      type: 'string', title: '国家', default: 'china', component: 'Select',
      enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }, { label: '韩国', value: 'korea' }, { label: '英国', value: 'uk' }],
    },
    areaCode: {
      type: 'string', title: '区号（自动）', componentProps: { disabled: true },
      reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CODE[ctx.values.country as string] ?? '') } } }],
    },
    currency: {
      type: 'string', title: '货币（自动）', componentProps: { disabled: true },
      reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CURRENCY[ctx.values.country as string] ?? '') } } }],
    },
    province: { type: 'string', title: '省', componentProps: { placeholder: '省' } },
    city: { type: 'string', title: '市', componentProps: { placeholder: '市' } },
    district: { type: 'string', title: '区', componentProps: { placeholder: '区' } },
    fullAddress: {
      type: 'string', title: '完整地址（聚合）', componentProps: { disabled: true },
      reactions: [{ watch: ['province', 'city', 'district'], fulfill: { run: (f: any, ctx: any) => {
        f.setValue([ctx.values.province, ctx.values.city, ctx.values.district].filter(Boolean).join(' '))
      } } }],
    },
  },
}
</script>
