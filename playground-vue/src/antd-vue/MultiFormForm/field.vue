<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      两个独立表单 / 联合提交 / 弹窗表单
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="mainForm">
          <div style="display: flex; gap: 16px">
            <!-- 左侧：主表单 -->
            <div style="flex: 1">
              <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
                <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">主表单 - 订单信息</div>
                <FormField name="orderName" :field-props="{ label: '订单名称', required: true, component: 'Input' }" />
                <FormField name="customer" :field-props="{ label: '客户', required: true, component: 'Input' }" />
                <FormField name="total" :field-props="{ label: '金额', required: true, component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' } }" />
                <button type="button" style="padding: 4px 15px; border: 1px dashed #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="modalOpen = true">
                  从弹窗填写联系人
                </button>
              </div>
            </div>
            <!-- 右侧：子表单 -->
            <div style="flex: 1">
              <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
                <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">子表单 - 联系人</div>
                <FormProvider :form="subForm">
                  <FormField v-for="n in SUB_FIELDS" :key="n" :name="n" :field-props="getSubFieldProps(n)" />
                </FormProvider>
              </div>
            </div>
          </div>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
    <!-- 弹窗表单（编辑联系人） -->
    <div v-if="modalOpen" style="position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center">
      <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.45)" @click="modalOpen = false" />
      <div style="position: relative; background: #fff; border-radius: 8px; padding: 24px; width: 520px; max-width: 90vw; box-shadow: 0 6px 16px rgba(0,0,0,0.08)">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 16px">编辑联系人</div>
        <FormProvider :form="subForm">
          <FormField v-for="n in SUB_FIELDS" :key="n" :name="n" :field-props="getSubFieldProps(n)" />
        </FormProvider>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
          <button type="button" style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px" @click="modalOpen = false">取消</button>
          <button type="button" style="padding: 4px 15px; border: none; border-radius: 6px; background: #1677ff; color: #fff; cursor: pointer; font-size: 14px" @click="modalOk">确定</button>
        </div>
      </div>
    </div>
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

/** 弹窗确认：校验子表单并同步客户名到主表单 */
async function modalOk(): Promise<void> {
  const res = await subForm.submit()
  if (res.errors.length > 0) return
  mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string)
  modalOpen.value = false
}
</script>
