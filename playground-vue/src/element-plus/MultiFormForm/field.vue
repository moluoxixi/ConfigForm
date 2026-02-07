<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      两个独立表单 / 联合提交 / 弹窗表单
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <ElRow :gutter="16">
      <ElCol :span="12">
        <ElCard title="主表单 - 订单信息" shadow="never">
          <FormProvider :form="mainForm">
            <FormField v-for="n in ['orderName', 'customer', 'total']" :key="n" v-slot="{ field }" :name="n">
              <ElFormItem :label="field.label">
                <ElInputNumber v-if="n === 'total'" :model-value="(field.value as number)" :disabled="mode === 'disabled'" :min="0" style="width: 100%" @update:model-value="field.setValue($event)" /><ElInput v-else :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
              </ElFormItem>
            </FormField><ElButton v-if="mode === 'editable'" type="info" @click="modalOpen = true">
              从弹窗填写联系人
            </ElButton>
          </FormProvider>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard title="子表单 - 联系人" shadow="never">
          <FormProvider :form="subForm">
            <FormField v-for="n in ['contactName', 'contactPhone', 'contactEmail']" :key="n" v-slot="{ field }" :name="n">
              <ElFormItem :label="field.label" :required="field.required" :error="field.errors[0]?.message">
                <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
              </ElFormItem>
            </FormField>
          </FormProvider>
        </ElCard>
      </ElCol>
    </ElRow>
    <ElButton v-if="mode === 'editable'" type="primary" style="margin-top: 16px" @click="jointSubmit">
      联合提交
    </ElButton>
    <ElDialog v-model="modalOpen" title="编辑联系人">
      <FormProvider :form="subForm">
        <FormField v-for="n in ['contactName', 'contactPhone', 'contactEmail']" :key="n" v-slot="{ field }" :name="n">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
      </FormProvider>
      <template #footer>
        <ElButton @click="modalOpen = false">
          取消
        </ElButton><ElButton type="primary" @click="modalOk">
          确定
        </ElButton>
      </template>
    </ElDialog>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="联合提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElCard, ElCol, ElDialog, ElFormItem, ElInput, ElInputNumber, ElRadioButton, ElRadioGroup, ElRow } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const modalOpen = ref(false)
const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } })
const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } })
onMounted(() => {
  mainForm.createField({ name: 'orderName', label: '订单名称', required: true })
  mainForm.createField({ name: 'customer', label: '客户', required: true })
  mainForm.createField({ name: 'total', label: '金额', required: true })
  subForm.createField({ name: 'contactName', label: '联系人', required: true })
  subForm.createField({ name: 'contactPhone', label: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] })
  subForm.createField({ name: 'contactEmail', label: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] })
})
async function jointSubmit(): Promise<void> {
  const [m, s] = await Promise.all([mainForm.submit(), subForm.submit()])
  const errs = [...m.errors, ...s.errors]
  result.value = errs.length > 0 ? `验证失败: ${errs.map(e => e.message).join(', ')}` : JSON.stringify({ main: m.values, contact: s.values }, null, 2)
}
async function modalOk(): Promise<void> {
  const res = await subForm.submit()
  if (res.errors.length > 0)
    return
  mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string)
  modalOpen.value = false
}
</script>
