<template>
  <div>
    <h2>模板复用</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      字段模板复用 + 继承覆盖 — FormField + 条件渲染实现
    </p>
    <div style="display: inline-flex; background: #f5f5f5; border-radius: 6px; padding: 2px; margin-bottom: 12px">
      <button v-for="opt in templateOptions" :key="opt.value" type="button" :style="{ padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', background: template === opt.value ? '#fff' : 'transparent', boxShadow: template === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', fontWeight: template === opt.value ? '600' : '400' }" @click="template = opt.value as TKey">
        {{ opt.label }}
      </button>
    </div>
    <span style="display: inline-block; margin-left: 8px; margin-bottom: 12px; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #91caff; background: #e6f4ff; color: #0958d9">
      复用片段：个人信息 + 地址 + 备注
    </span>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <!-- 公共字段：个人信息 -->
          <FormField name="name" :field-props="{ label: TEMPLATES[template].nameLabel, required: true, component: 'Input', rules: [{ minLength: 2, message: '至少 2 字' }] }" />
          <FormField name="phone" :field-props="{ label: '手机号', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] }" />
          <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] }" />
          <!-- 模板特有字段 -->
          <template v-if="template === 'employee'">
            <FormField name="department" :field-props="{ label: '部门', required: true, component: 'Select', dataSource: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] }" />
            <FormField name="position" :field-props="{ label: '职位', required: true, component: 'Input' }" />
          </template>
          <template v-if="template === 'customer'">
            <FormField name="company" :field-props="{ label: '所属公司', component: 'Input' }" />
            <FormField name="level" :field-props="{ label: '等级', component: 'Select', dataSource: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }] }" />
          </template>
          <template v-if="template === 'supplier'">
            <FormField name="companyName" :field-props="{ label: '公司名称', required: true, component: 'Input' }" />
            <FormField name="creditCode" :field-props="{ label: '信用代码', required: true, component: 'Input', rules: [{ pattern: '^[0-9A-Z]{18}$', message: '18 位' }] }" />
          </template>
          <!-- 公共字段：地址 + 备注 -->
          <FormField name="province" :field-props="{ label: '省份', component: 'Select', dataSource: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] }" />
          <FormField name="city" :field-props="{ label: '城市', component: 'Input' }" />
          <FormField name="address" :field-props="{ label: '详细地址', component: 'Textarea' }" />
          <FormField name="remark" :field-props="{ label: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 模板复用 — Field 模式
 *
 * 使用 FormProvider + FormField + 条件渲染实现不同业务模板。
 * 公共字段（个人信息、地址、备注）始终显示，模板特有字段通过 v-if 切换。
 */
import { ref, watch } from 'vue'

setupElementPlus()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 模板类型 */
type TKey = 'employee' | 'customer' | 'supplier'

const template = ref<TKey>('employee')
const templateOptions = [
  { label: '员工入职', value: 'employee' },
  { label: '客户登记', value: 'customer' },
  { label: '供应商注册', value: 'supplier' },
]

/** 模板配置：不同模板的名称标签 */
const TEMPLATES: Record<TKey, { nameLabel: string }> = {
  employee: { nameLabel: '员工姓名' },
  customer: { nameLabel: '客户姓名' },
  supplier: { nameLabel: '联系人' },
}

const form = useCreateForm({
  initialValues: {
    name: '',
    phone: '',
    email: '',
    department: undefined,
    position: '',
    company: '',
    level: undefined,
    companyName: '',
    creditCode: '',
    province: undefined,
    city: '',
    address: '',
    remark: '',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
