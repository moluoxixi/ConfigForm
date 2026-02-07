<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">两个独立表单 / 联合提交 / 弹窗表单</p>
    <PlaygroundForm :form="mainForm">
      <template #default="{ form: f, mode }">
        <ARow :gutter="16">
          <ACol :span="12"><ACard title="主表单 - 订单信息" size="small"><FormField v-for="n in ['orderName','customer','total']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label"><template v-if="mode === 'readOnly'"><span>{{ field.value ?? '—' }}</span></template><template v-else><AInputNumber v-if="n === 'total'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :min="0" style="width: 100%" /><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></template></AFormItem></FormField><AButton v-if="mode === 'editable'" type="dashed" @click="modalOpen = true">从弹窗填写联系人</AButton></ACard></ACol>
          <ACol :span="12"><ACard title="子表单 - 联系人" size="small"><FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label" :required="field.required" :validate-status="field.errors.length > 0 ? 'error' : undefined" :help="field.errors[0]?.message"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" :disabled="mode === 'disabled'" /></AFormItem></FormField></FormProvider></ACard></ACol>
        </ARow>
        <AButton v-if="mode === 'editable'" type="primary" style="margin-top: 16px" @click="jointSubmit">联合提交</AButton>
      </template>
    </PlaygroundForm>
    <AModal v-model:open="modalOpen" title="编辑联系人" @ok="modalOk">
      <FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" /></AFormItem></FormField></FormProvider>
    </AModal>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Row as ARow, Col as ACol, Modal as AModal } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const modalOpen = ref(false)
const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } })
const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } })
watch(() => mainForm.pattern, (v) => { subForm.pattern = v })
onMounted(() => {
  mainForm.createField({ name: 'orderName', label: '订单名称', required: true }); mainForm.createField({ name: 'customer', label: '客户', required: true }); mainForm.createField({ name: 'total', label: '金额', required: true })
  subForm.createField({ name: 'contactName', label: '联系人', required: true }); subForm.createField({ name: 'contactPhone', label: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] }); subForm.createField({ name: 'contactEmail', label: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] })
})
async function jointSubmit(): Promise<void> { await Promise.all([mainForm.submit(), subForm.submit()]) }
async function modalOk(): Promise<void> { const res = await subForm.submit(); if (res.errors.length > 0) return; mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string); modalOpen.value = false }
</script>
