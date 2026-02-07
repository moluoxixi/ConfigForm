<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      两个独立表单 / 联合提交 / 弹窗表单
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="mainForm">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <ARow :gutter="16">
            <!-- 左侧：主表单 -->
            <ACol :span="12">
              <ACard title="主表单 - 订单信息" size="small">
                <FormField name="orderName" :field-props="{ label: '订单名称', required: true, component: 'Input' }" />
                <FormField name="customer" :field-props="{ label: '客户', required: true, component: 'Input' }" />
                <FormField name="total" :field-props="{ label: '金额', required: true, component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' } }" />
                <AButton v-if="mode === 'editable'" type="dashed" @click="modalOpen = true">
                  从弹窗填写联系人
                </AButton>
              </ACard>
            </ACol>
            <!-- 右侧：子表单 -->
            <ACol :span="12">
              <ACard title="子表单 - 联系人" size="small">
                <FormProvider :form="subForm">
                  <FormField v-for="n in SUB_FIELDS" :key="n" :name="n" :field-props="getSubFieldProps(n)" />
                </FormProvider>
              </ACard>
            </ACol>
          </ARow>
          <LayoutFormActions v-if="mode === 'editable'" @reset="mainForm.reset(); subForm.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
    <!-- 弹窗表单（编辑联系人） -->
    <AModal v-model:open="modalOpen" title="编辑联系人" @ok="modalOk">
      <FormProvider :form="subForm">
        <FormField v-for="n in SUB_FIELDS" :key="n" :name="n" :field-props="getSubFieldProps(n)" />
      </FormProvider>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 多表单协作 — Field 模式
 *
 * 主表单（订单）和子表单（联系人）各自使用 FormProvider + FormField + fieldProps。
 * 弹窗表单复用 subForm 实例，联合提交同时校验两个表单。
 */
import { Button as AButton, Card as ACard, Col as ACol, Modal as AModal, Row as ARow } from 'ant-design-vue'
import { ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()
const modalOpen = ref(false)

/** 子表单字段名列表 */
const SUB_FIELDS = ['contactName', 'contactPhone', 'contactEmail']

/** 子表单字段 fieldProps 配置 */
function getSubFieldProps(name: string): Record<string, unknown> {
  const defs: Record<string, Record<string, unknown>> = {
    contactName: { label: '联系人', required: true, component: 'Input' },
    contactPhone: { label: '电话', required: true, component: 'Input', rules: [{ format: 'phone', message: '无效手机号' }] },
    contactEmail: { label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '无效邮箱' }] },
  }
  return defs[name] ?? { component: 'Input' }
}

const mainForm = useCreateForm({
  initialValues: { orderName: '', customer: '', total: 0 },
})

const subForm = useCreateForm({
  initialValues: { contactName: '', contactPhone: '', contactEmail: '' },
})

/** 同步 StatusTabs 的 mode 到两个表单 */
watch(() => st.value?.mode, (v) => {
  if (v) {
    mainForm.pattern = v as FieldPattern
  }
}, { immediate: true })

watch(() => mainForm.pattern, (v) => {
  subForm.pattern = v
})

/** 联合提交：同时校验主表单和子表单 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const [mainRes, subRes] = await Promise.all([mainForm.submit(), subForm.submit()])
  const allErrors = [...mainRes.errors, ...subRes.errors]
  if (allErrors.length > 0) {
    st.value?.showErrors(allErrors)
  }
  else {
    showResult({ ...mainRes.values, ...subRes.values })
  }
}

/** 弹窗确认：校验子表单并同步客户名到主表单 */
async function modalOk(): Promise<void> {
  const res = await subForm.submit()
  if (res.errors.length > 0) return
  mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string)
  modalOpen.value = false
}
</script>
