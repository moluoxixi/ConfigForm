<template>
  <div>
    <h2>属性联动（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      动态 disabled / required / placeholder / componentProps - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="enableRemark" :field-props="{ label: '启用备注', component: 'Switch' }" />
          <FormField name="remark" :field-props="{ label: '备注内容', component: 'Textarea', disabled: true, componentProps: { placeholder: '请先开启' } }" />
          <FormField name="contactType" :field-props="{ label: '联系方式类型', component: 'Select', dataSource: CONTACT_TYPE_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          <FormField name="contactValue" :field-props="{ label: '联系方式', required: true, component: 'Input', componentProps: { placeholder: '请输入手机号' } }" />
          <FormField name="productType" :field-props="{ label: '产品类型', component: 'RadioGroup', dataSource: PRODUCT_TYPE_OPTIONS }" />
          <FormField name="quantity" :field-props="{ label: '数量', component: 'InputNumber', description: '根据产品类型调整 step', componentProps: { min: 1, step: 1, addonAfter: '件' } }" />
          <FormField name="isVip" :field-props="{ label: 'VIP 用户', component: 'Switch', description: '开启后公司名称和工号必填' }" />
          <FormField name="vipCompany" :field-props="{ label: '公司名称', component: 'Input', componentProps: { placeholder: 'VIP 必填' } }" />
          <FormField name="vipId" :field-props="{ label: '工号', component: 'Input', componentProps: { placeholder: 'VIP 必填' } }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 联系方式类型选项 */
const CONTACT_TYPE_OPTIONS = [
  { label: '手机', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '微信', value: 'wechat' },
]

/** 产品类型选项 */
const PRODUCT_TYPE_OPTIONS = [
  { label: '标准品', value: 'standard' },
  { label: '计重品', value: 'weight' },
]

/** 联系方式类型 → placeholder / required 配置映射 */
const CONTACT_CONFIG: Record<string, { placeholder: string; required: boolean }> = {
  phone: { placeholder: '11 位手机号', required: true },
  email: { placeholder: '邮箱地址', required: true },
  wechat: { placeholder: '微信号（选填）', required: false },
}

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { enableRemark: false, remark: '', contactType: 'phone', contactValue: '', productType: 'standard', quantity: 1, isVip: false, vipCompany: '', vipId: '' },
})

// ========== 属性联动 ==========

/** 启用备注 → 控制备注字段的 disabled 状态 */
form.onFieldValueChange('enableRemark', (value: unknown) => {
  const field = form.getField('remark')
  if (field) field.disabled = !(value as boolean)
})

/** 联系方式类型 → 切换 placeholder 和 required */
form.onFieldValueChange('contactType', (value: unknown) => {
  const field = form.getField('contactValue')
  if (!field) return
  const cfg = CONTACT_CONFIG[value as string] ?? { placeholder: '请输入', required: false }
  field.setComponentProps({ placeholder: cfg.placeholder })
  field.required = cfg.required
})

/** 产品类型 → 切换数量字段的 step / min / addonAfter */
form.onFieldValueChange('productType', (value: unknown) => {
  const field = form.getField('quantity')
  if (!field) return
  if (value === 'weight') {
    field.setComponentProps({ min: 0.01, step: 0.01, addonAfter: 'kg' })
  }
  else {
    field.setComponentProps({ min: 1, step: 1, addonAfter: '件' })
  }
})

/** VIP 开关 → 控制公司名称和工号的 required 状态 */
form.onFieldValueChange('isVip', (value: unknown) => {
  const isVip = value as boolean
  const companyField = form.getField('vipCompany')
  const idField = form.getField('vipId')
  if (companyField) companyField.required = isVip
  if (idField) idField.required = isVip
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
