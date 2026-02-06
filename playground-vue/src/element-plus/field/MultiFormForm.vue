<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">两个独立表单 / 联合提交 / 弹窗表单</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <el-row :gutter="16">
      <el-col :span="12"><el-card title="主表单 - 订单信息" shadow="never"><FormProvider :form="mainForm"><FormField v-for="n in ['orderName','customer','total']" :key="n" v-slot="{ field }" :name="n"><el-form-item :label="field.label"><el-input-number v-if="n === 'total'" :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :min="0" style="width: 100%" /><el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" /></el-form-item></FormField><el-button v-if="mode === 'editable'" type="info" @click="modalOpen = true">从弹窗填写联系人</el-button></FormProvider></el-card></el-col>
      <el-col :span="12"><el-card title="子表单 - 联系人" shadow="never"><FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><el-form-item :label="field.label" :required="field.required" :error="field.errors[0]?.message"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" :disabled="mode === 'disabled'" /></el-form-item></FormField></FormProvider></el-card></el-col>
    </el-row>
    <el-button v-if="mode === 'editable'" type="primary" style="margin-top: 16px" @click="jointSubmit">联合提交</el-button>
    <el-dialog v-model="modalOpen" title="编辑联系人">
      <FormProvider :form="subForm"><FormField v-for="n in ['contactName','contactPhone','contactEmail']" :key="n" v-slot="{ field }" :name="n"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" /></el-form-item></FormField></FormProvider>
      <template #footer><el-button @click="modalOpen = false">取消</el-button><el-button type="primary" @click="modalOk">确定</el-button></template>
    </el-dialog>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="联合提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem, ElCard, ElRow, ElCol, ElDialog } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const modalOpen = ref(false)
const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } })
const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } })
onMounted(() => {
  mainForm.createField({ name: 'orderName', label: '订单名称', required: true }); mainForm.createField({ name: 'customer', label: '客户', required: true }); mainForm.createField({ name: 'total', label: '金额', required: true })
  subForm.createField({ name: 'contactName', label: '联系人', required: true }); subForm.createField({ name: 'contactPhone', label: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] }); subForm.createField({ name: 'contactEmail', label: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] })
})
async function jointSubmit(): Promise<void> { const [m, s] = await Promise.all([mainForm.submit(), subForm.submit()]); const errs = [...m.errors, ...s.errors]; result.value = errs.length > 0 ? '验证失败: ' + errs.map(e => e.message).join(', ') : JSON.stringify({ main: m.values, contact: s.values }, null, 2) }
async function modalOk(): Promise<void> { const res = await subForm.submit(); if (res.errors.length > 0) return; mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string); modalOpen.value = false }
</script>
