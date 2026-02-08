<template>
  <div>
    <h2>显隐联动（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      用户类型切换 / 开关控制多字段 / 嵌套显隐 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="userType" :field-props="{ label: '用户类型', required: true, component: 'RadioGroup', dataSource: USER_TYPE_OPTIONS }" />
          <FormField name="realName" :field-props="{ label: '真实姓名', required: true, component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '请输入' } }" />
          <FormField name="idCard" :field-props="{ label: '身份证号', component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '18 位' }, rules: idCardRules }" />
          <FormField name="companyName" :field-props="{ label: '公司名称', required: true, component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '请输入' } }" />
          <FormField name="taxNumber" :field-props="{ label: '税号', component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '请输入' } }" />
          <FormField name="enableNotify" :field-props="{ label: '开启通知', component: 'Switch' }" />
          <FormField name="notifyEmail" :field-props="{ label: '通知邮箱', component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
          <FormField name="notifyFrequency" :field-props="{ label: '通知频率', component: 'Select', excludeWhenHidden: true, dataSource: FREQUENCY_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          <FormField name="hasAddress" :field-props="{ label: '填写地址', component: 'Switch' }" />
          <FormField name="city" :field-props="{ label: '城市', component: 'Input', excludeWhenHidden: true, componentProps: { placeholder: '请输入城市' } }" />
          <FormField name="hasDetailAddress" :field-props="{ label: '填写详细地址', component: 'Switch' }" />
          <FormField name="detailAddress" :field-props="{ label: '详细地址', component: 'Textarea', excludeWhenHidden: true, componentProps: { placeholder: '请输入详细地址' } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
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

/** 用户类型选项 */
const USER_TYPE_OPTIONS = [
  { label: '个人', value: 'personal' },
  { label: '企业', value: 'business' },
]

/** 通知频率选项 */
const FREQUENCY_OPTIONS = [
  { label: '实时', value: 'realtime' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
]

/** 身份证验证规则 */
const idCardRules = [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { userType: 'personal', realName: '', idCard: '', companyName: '', taxNumber: '', enableNotify: false, notifyEmail: '', notifyFrequency: undefined, hasAddress: false, city: '', hasDetailAddress: false, detailAddress: '' },
})

// ========== 初始可见性设置 ==========

/* 企业字段初始隐藏（userType 默认为 personal） */
form.getField('companyName')?.setVisible(false)
form.getField('taxNumber')?.setVisible(false)

/* 通知相关字段初始隐藏（enableNotify 默认 false） */
form.getField('notifyEmail')?.setVisible(false)
form.getField('notifyFrequency')?.setVisible(false)

/* 地址相关字段初始隐藏（hasAddress 默认 false） */
form.getField('city')?.setVisible(false)
form.getField('hasDetailAddress')?.setVisible(false)
form.getField('detailAddress')?.setVisible(false)

// ========== 显隐联动 ==========

/** 用户类型 → 切换个人/企业字段的可见性 */
form.onFieldValueChange('userType', (value: unknown) => {
  const isPersonal = value === 'personal'
  const isBusiness = value === 'business'
  /* 个人字段 */
  form.getField('realName')?.setVisible(isPersonal)
  form.getField('idCard')?.setVisible(isPersonal)
  /* 企业字段 */
  form.getField('companyName')?.setVisible(isBusiness)
  form.getField('taxNumber')?.setVisible(isBusiness)
})

/** 开启通知 → 控制通知邮箱和频率的可见性 */
form.onFieldValueChange('enableNotify', (value: unknown) => {
  const enabled = value as boolean
  form.getField('notifyEmail')?.setVisible(enabled)
  form.getField('notifyFrequency')?.setVisible(enabled)
})

/** 填写地址 → 控制城市和详细地址的可见性 */
form.onFieldValueChange('hasAddress', (value: unknown) => {
  const has = value as boolean
  form.getField('city')?.setVisible(has)
  form.getField('hasDetailAddress')?.setVisible(has)
  if (!has) {
    /* 父开关关闭时，子字段也隐藏 */
    form.getField('detailAddress')?.setVisible(false)
  }
  else {
    /* 父开关开启时，根据子开关决定详细地址是否可见 */
    const hasDetail = form.getField('hasDetailAddress')?.value as boolean
    form.getField('detailAddress')?.setVisible(!!hasDetail)
  }
})

/** 填写详细地址（嵌套）→ 仅在「填写地址」开启时生效 */
form.onFieldValueChange('hasDetailAddress', (value: unknown) => {
  const hasAddr = form.getField('hasAddress')?.value as boolean
  form.getField('detailAddress')?.setVisible(!!hasAddr && !!(value as boolean))
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
