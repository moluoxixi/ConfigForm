<template>
  <div>
    <h2>自定义验证规则（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      正则 / 自定义函数 / 多规则 / 警告级 / 条件规则 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="licensePlate" :field-props="{ label: '车牌号', component: 'Input', componentProps: { placeholder: '京A12345' }, rules: licensePlateRules }" />
          <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', componentProps: { placeholder: '中国大陆手机号' }, rules: phoneRules }" />
          <FormField name="password" :field-props="{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '8-32 位' }, rules: passwordRules }" />
          <FormField name="age" :field-props="{ label: '年龄', required: true, component: 'InputNumber', rules: ageRules }" />
          <FormField name="idType" :field-props="{ label: '证件类型', required: true, component: 'Select', dataSource: ID_TYPE_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          <FormField name="idNumber" :field-props="{ label: '证件号码', required: true, component: 'Input', componentProps: { placeholder: '18 位身份证' } }" />
          <FormField name="ipAddress" :field-props="{ label: 'IP 地址', component: 'Input', componentProps: { placeholder: '192.168.1.1' }, rules: ipAddressRules }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 弱密码黑名单 */
const WEAK_PWD = ['12345678', 'password', 'qwerty123']

/** 证件类型选项 */
const ID_TYPE_OPTIONS = [
  { label: '身份证', value: 'idcard' },
  { label: '护照', value: 'passport' },
  { label: '军官证', value: 'military' },
]

// ========== 验证规则 ==========

/** 车牌号规则：汉字 + 字母 + 5 位字母数字 */
const licensePlateRules = [{ pattern: /^[\u4E00-\u9FA5][A-Z][A-Z0-9]{5}$/, message: '无效车牌号' }]

/** 手机号规则：中国大陆 11 位 */
const phoneRules = [{
  validator: (v: unknown): string | undefined => {
    if (!v) return undefined
    if (!/^1[3-9]\d{9}$/.test(String(v)))
      return '无效大陆手机号'
    return undefined
  },
}]

/** 密码规则：长度 + 多种字符类型 + 弱密码检测 */
const passwordRules = [
  { stopOnFirstFailure: true, minLength: 8, maxLength: 32, message: '8-32 字符' },
  { pattern: /[a-z]/, message: '需含小写' },
  { pattern: /[A-Z]/, message: '需含大写' },
  { pattern: /\d/, message: '需含数字' },
  { validator: (v: unknown): string | undefined => WEAK_PWD.includes(String(v).toLowerCase()) ? '密码过于简单' : undefined },
]

/** 年龄规则：范围校验 + 警告级提示 */
const ageRules = [
  { min: 0, max: 150, message: '0-150' },
  {
    level: 'warning',
    validator: (v: unknown): string | undefined => {
      const a = Number(v)
      if (a > 0 && a < 18) return '未成年部分功能受限'
      if (a > 60) return '建议开启大字模式'
      return undefined
    },
  },
]

/** IP 地址规则：IPv4 格式验证 */
const ipAddressRules = [{
  validator: (v: unknown): string | undefined => {
    if (!v) return undefined
    const parts = String(v).split('.')
    if (parts.length !== 4) return 'IP 格式错误'
    for (const p of parts) {
      const n = Number(p)
      if (Number.isNaN(n) || n < 0 || n > 255 || String(n) !== p)
        return '各段 0-255 整数'
    }
    return undefined
  },
}]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { licensePlate: '', phone: '', password: '', age: undefined, idType: 'idcard', idNumber: '', ipAddress: '' },
})

/** 证件类型变化 → 切换证件号码的验证规则和提示 */
form.onFieldValueChange('idType', (value: unknown) => {
  const field = form.getField('idNumber')
  if (!field) return
  const t = value as string
  field.setValue('')
  field.errors = []
  if (t === 'idcard') {
    field.rules = [{ required: true, message: '请输入' }, { pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]
    field.setComponentProps({ placeholder: '18 位身份证' })
  }
  else if (t === 'passport') {
    field.rules = [{ required: true, message: '请输入' }, { pattern: /^[A-Z]\d{8}$/, message: '格式：E12345678' }]
    field.setComponentProps({ placeholder: 'E12345678' })
  }
  else {
    field.rules = [{ required: true, message: '请输入' }, { minLength: 6, maxLength: 12, message: '6-12 位' }]
    field.setComponentProps({ placeholder: '军官证号' })
  }
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
