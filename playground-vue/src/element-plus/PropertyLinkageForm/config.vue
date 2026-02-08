<template>
  <div>
    <h2>属性联动</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      动态 disabled / required / placeholder / componentProps — ConfigForm + ISchema 实现
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
 * 属性联动 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现属性联动：
 * - 动态 disabled（开关控制备注可编辑）
 * - 动态 placeholder / required（联系方式类型切换）
 * - 动态 componentProps（产品类型切换 step）
 * - 多字段联动必填（VIP 用户）
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

const initialValues = {
  enableRemark: false, remark: '', contactType: 'phone', contactValue: '',
  productType: 'standard', quantity: 1, isVip: false, vipCompany: '', vipId: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    enableRemark: { type: 'boolean', title: '启用备注', default: false, component: 'Switch' },
    remark: {
      type: 'string', title: '备注内容', component: 'Textarea',
      componentProps: { placeholder: '请先开启' }, disabled: true,
      reactions: [{ watch: 'enableRemark', when: (v: unknown[]) => v[0] === true, fulfill: { state: { disabled: false } }, otherwise: { state: { disabled: true } } }],
    },
    contactType: {
      type: 'string', title: '联系方式类型', default: 'phone', component: 'Select',
      enum: [{ label: '手机', value: 'phone' }, { label: '邮箱', value: 'email' }, { label: '微信', value: 'wechat' }],
    },
    contactValue: {
      type: 'string', title: '联系方式', required: true,
      componentProps: { placeholder: '请输入手机号' },
      reactions: [{ watch: 'contactType', fulfill: { run: (f: any, ctx: any) => {
        const t = ctx.values.contactType as string
        const c: Record<string, { placeholder: string, required: boolean }> = {
          phone: { placeholder: '11 位手机号', required: true },
          email: { placeholder: '邮箱地址', required: true },
          wechat: { placeholder: '微信号（选填）', required: false },
        }
        const cfg = c[t] ?? { placeholder: '请输入', required: false }
        f.setComponentProps({ placeholder: cfg.placeholder })
        f.required = cfg.required
      } } }],
    },
    productType: {
      type: 'string', title: '产品类型', default: 'standard', component: 'RadioGroup',
      enum: [{ label: '标准品', value: 'standard' }, { label: '计重品', value: 'weight' }],
    },
    quantity: {
      type: 'number', title: '数量', default: 1, component: 'InputNumber',
      description: '根据产品类型调整 step',
      reactions: [{ watch: 'productType', fulfill: { run: (f: any, ctx: any) => {
        f.setComponentProps(ctx.values.productType === 'weight'
          ? { min: 0.01, step: 0.01, addonAfter: 'kg' }
          : { min: 1, step: 1, addonAfter: '件' })
      } } }],
    },
    isVip: {
      type: 'boolean', title: 'VIP 用户', default: false, component: 'Switch',
      description: '开启后公司名称和工号必填',
    },
    vipCompany: {
      type: 'string', title: '公司名称',
      componentProps: { placeholder: 'VIP 必填' },
      reactions: [{ watch: 'isVip', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }],
    },
    vipId: {
      type: 'string', title: '工号',
      componentProps: { placeholder: 'VIP 必填' },
      reactions: [{ watch: 'isVip', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }],
    },
  },
}
</script>
