<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">两个独立表单 / 联合提交 / 弹窗表单</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ARow :gutter="16">
      <ACol :span="12"><ACard title="主表单 - 订单信息" size="small"><FormProvider :form="mainForm"><FormField v-for="n in ['orderName','customer','total']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label"><template v-if="mode === 'readOnly'"><span>{{ field.value ?? '—' }}</span></template><template v-else><AInputNumber v-if="n === 'total'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :min="0" style="width: 100%" /><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></template></AFormItem></FormField><AButton v-if="mode === 'editable'" type="dashed" @click="modalOpen = true">从弹窗填写联系人</AButton></FormProvider></ACard></ACol>
      <ACol :span="12"><ACard title="子表单 - 联系人" size="small"><FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label" :required="field.required" :validate-status="field.errors.length > 0 ? 'error' : undefined" :help="field.errors[0]?.message"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" :disabled="mode === 'disabled'" /></AFormItem></FormField></FormProvider></ACard></ACol>
    </ARow>
    <AButton v-if="mode === 'editable'" type="primary" style="margin-top: 16px" @click="jointSubmit">联合提交</AButton>
    <AModal v-model:open="modalOpen" title="编辑联系人" @ok="modalOk">
      <FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" /></AFormItem></FormField></FormProvider>
    </AModal>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="联合提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Alert as AAlert, Segmented as ASegmented, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Row as ARow, Col as ACol, Modal as AModal } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const modalOpen = ref(false)
const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } })
watch(mode, (v) => { mainForm.pattern = v })
const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } })
watch(mode, (v) => { subForm.pattern = v })
onMounted(() => {
  mainForm.createField({ name: 'orderName', label: '订单名称', required: true }); mainForm.createField({ name: 'customer', label: '客户', required: true }); mainForm.createField({ name: 'total', label: '金额', required: true })
  subForm.createField({ name: 'contactName', label: '联系人', required: true }); subForm.createField({ name: 'contactPhone', label: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] }); subForm.createField({ name: 'contactEmail', label: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] })
})
async function jointSubmit(): Promise<void> { const [m, s] = await Promise.all([mainForm.submit(), subForm.submit()]); const errs = [...m.errors, ...s.errors]; result.value = errs.length > 0 ? '验证失败: ' + errs.map(e => e.message).join(', ') : JSON.stringify({ main: m.values, contact: s.values }, null, 2) }
async function modalOk(): Promise<void> { const res = await subForm.submit(); if (res.errors.length > 0) return; mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string); modalOpen.value = false }
</script>
