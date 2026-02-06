<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 多表单协作
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      两个独立表单联合提交 / 跨表单联动 / a-modal 弹窗表单
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- 表单 1：基本信息 -->
      <ACard>
        <template #title>
          <span>基本信息表单 <ATag color="blue">表单 A</ATag></span>
        </template>
        <FormProvider :form="basicForm">
          <FormField v-slot="{ field }" name="name">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="请输入姓名" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
          <FormField v-slot="{ field }" name="email">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="请输入邮箱" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
          <FormField v-slot="{ field }" name="phone">
            <AFormItem :label="field.label" :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="选填" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
        </FormProvider>
      </ACard>

      <!-- 表单 2：地址信息 -->
      <ACard>
        <template #title>
          <span>地址信息表单 <ATag color="green">表单 B</ATag></span>
        </template>
        <FormProvider :form="addressForm">
          <FormField v-slot="{ field }" name="province">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <ASelect
                :value="(field.value as string) || undefined" placeholder="请选择省份" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                @update:value="field.setValue($event)"
              />
            </AFormItem>
          </FormField>
          <FormField v-slot="{ field }" name="city">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="切换省份会自动清空" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
          <FormField v-slot="{ field }" name="detail">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="请输入详细地址" @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
        </FormProvider>
      </ACard>
    </div>

    <!-- 操作按钮 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <AButton type="primary" @click="handleCombinedSubmit">
        联合提交两个表单
      </AButton>
      <AButton @click="openDialog">
        打开弹窗表单
      </AButton>
    </div>

    <!-- a-modal 弹窗表单 -->
    <AModal v-model:open="showDialog" title="弹窗表单" :width="500" destroy-on-close @ok="handleDialogSubmit">
      <FormProvider :form="dialogForm">
        <FormField v-slot="{ field }" name="note">
          <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
            <ATextarea :value="(field.value as string)" :rows="3" placeholder="请输入备注（至少 5 个字符）" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="priority">
          <AFormItem :label="field.label">
            <ASelect
              :value="(field.value as string)" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
              @update:value="field.setValue($event)"
            />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="assignee">
          <AFormItem :label="field.label">
            <AInput :value="(field.value as string)" placeholder="请输入负责人姓名" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
      </FormProvider>
    </AModal>

    <!-- 弹窗结果 -->
    <ACard v-if="dialogResult" style="margin-bottom: 20px;">
      <template #title>
        <strong>弹窗表单结果</strong> <ATag color="orange">
          Dialog
        </ATag>
      </template>
      <pre style="margin: 0; font-size: 13px;">{{ dialogResult }}</pre>
    </ACard>

    <!-- 联合提交结果 -->
    <ACard v-if="submitResult">
      <template #title>
        <strong>联合提交结果</strong>
      </template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Modal as AModal, Select as ASelect, Tag as ATag, Textarea as ATextarea, message } from 'ant-design-vue'
/**
 * Ant Design Vue Field 组件模式 - 多表单协作
 *
 * 覆盖场景：
 * - 两个独立表单联合提交
 * - 跨表单联动（省份变化清空城市）
 * - a-modal 弹窗表单
 */
import { ref } from 'vue'

setupAntdVue()

/* ======== 表单 1：基本信息 ======== */
const basicForm = useCreateForm({ initialValues: { name: '', email: '', phone: '' } })
basicForm.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '姓名至少 2 个字符' }] })
basicForm.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email' }] })
basicForm.createField({ name: 'phone', label: '手机号', rules: [{ format: 'phone' }] })

/* ======== 表单 2：地址信息 ======== */
const addressForm = useCreateForm({ initialValues: { province: '', city: '', detail: '' } })
addressForm.createField({
  name: 'province',
  label: '省份',
  required: true,
  dataSource: [{ label: '北京', value: '北京' }, { label: '上海', value: '上海' }, { label: '广东', value: '广东' }, { label: '浙江', value: '浙江' }],
})
addressForm.createField({ name: 'city', label: '城市', required: true })
addressForm.createField({ name: 'detail', label: '详细地址', required: true })

/* 跨表单联动：province 变化时清空 city */
const provinceField = addressForm.getField('province')
if (provinceField) {
  provinceField.onValueChange(() => {
    const cityField = addressForm.getField('city')
    if (cityField)
      cityField.setValue('')
  })
}

/* ======== 弹窗表单 ======== */
const showDialog = ref(false)
const dialogForm = useCreateForm({ initialValues: { note: '', priority: 'normal', assignee: '' } })
dialogForm.createField({ name: 'note', label: '备注内容', required: true, rules: [{ minLength: 5, message: '备注至少 5 个字符' }] })
dialogForm.createField({
  name: 'priority',
  label: '优先级',
  dataSource: [{ label: '紧急', value: 'urgent' }, { label: '普通', value: 'normal' }, { label: '低', value: 'low' }],
})
dialogForm.createField({ name: 'assignee', label: '指派给', placeholder: '可选' })
const dialogResult = ref('')
const submitResult = ref('')

/** 联合提交两个表单 */
async function handleCombinedSubmit(): Promise<void> {
  const [basicResult, addressResult] = await Promise.all([basicForm.submit(), addressForm.submit()])
  const allErrors = [...basicResult.errors, ...addressResult.errors]
  if (allErrors.length > 0) {
    submitResult.value = `验证失败:\n${allErrors.map(e => `  ${e.path}: ${e.message}`).join('\n')}`
    message.error('部分表单验证失败')
  }
  else {
    submitResult.value = JSON.stringify({ basic: basicResult.values, address: addressResult.values }, null, 2)
    message.success('联合提交成功！')
  }
}

/** 弹窗表单提交 */
async function handleDialogSubmit(): Promise<void> {
  const result = await dialogForm.submit()
  if (result.errors.length > 0) {
    message.warning('请完善弹窗表单')
    return
  }
  dialogResult.value = JSON.stringify(result.values, null, 2)
  showDialog.value = false
  message.success('弹窗表单提交成功')
}

/** 打开弹窗时重置 */
function openDialog(): void {
  dialogForm.reset()
  showDialog.value = true
}
</script>
