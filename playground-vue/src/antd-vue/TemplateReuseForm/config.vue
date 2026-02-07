<template>
  <div>
    <h2>模板复用</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Schema 片段复用 + 继承覆盖 = 不同业务表单
    </p>
    <ASegmented v-model:value="template" :options="templateOptions" style="margin-bottom: 12px" />
    <ATag color="blue" style="display: inline-block; margin-bottom: 12px">
      复用片段：个人信息 + 地址 + 备注
    </ATag>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { Segmented as ASegmented, Tag as ATag } from 'ant-design-vue'
import { computed, ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

type TKey = 'employee' | 'customer' | 'supplier'
const template = ref<TKey>('employee')
const templateOptions = [{ label: '员工入职', value: 'employee' }, { label: '客户登记', value: 'customer' }, { label: '供应商注册', value: 'supplier' }]

const PERSON: Record<string, any> = { name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] }, phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] }, email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] } }
const ADDRESS: Record<string, any> = { province: { type: 'string', title: '省份', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] }, city: { type: 'string', title: '城市' }, address: { type: 'string', title: '详细地址', component: 'Textarea' } }
const REMARK: Record<string, any> = { remark: { type: 'string', title: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] } }

const TEMPLATES: Record<TKey, { overrides: Record<string, any> }> = {
  employee: { overrides: { department: { type: 'string', title: '部门', required: true, enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] }, position: { type: 'string', title: '职位', required: true }, name: { type: 'string', title: '员工姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] } } },
  customer: { overrides: { company: { type: 'string', title: '所属公司' }, level: { type: 'string', title: '等级', enum: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }] }, name: { type: 'string', title: '客户姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] } } },
  supplier: { overrides: { companyName: { type: 'string', title: '公司名称', required: true }, creditCode: { type: 'string', title: '信用代码', required: true, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位' }] }, name: { type: 'string', title: '联系人', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] } } },
}

const schema = computed<ISchema>(() => {
  const properties: Record<string, any> = { ...PERSON, ...ADDRESS, ...REMARK }
  const t = TEMPLATES[template.value]
  for (const [k, v] of Object.entries(t.overrides)) {
    properties[k] = properties[k] ? { ...properties[k], ...v } : v
  }
  return { type: 'object', decoratorProps: { labelPosition: 'right', labelWidth: '120px' }, properties }
})
</script>
