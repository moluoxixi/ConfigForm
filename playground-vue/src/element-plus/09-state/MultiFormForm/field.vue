<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      两个独立表单 / 联合提交 / 弹窗表单
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1; border: 1px solid #e4e7ed; border-radius: 4px; padding: 16px">
        <h4 style="margin: 0 0 12px">主表单 - 订单信息</h4>
        <FormProvider :form="mainForm">
          <FormField v-for="n in ['orderName', 'customer', 'total']" :key="n" v-slot="{ field }" :name="n">
            <div style="margin-bottom: 18px">
              <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
              <input v-if="n === 'total'" type="number" :value="(field.value as number)" :disabled="mode === 'disabled'" min="0" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
              <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
            </div>
          </FormField>
          <button type="button" style="padding: 8px 16px; background: #909399; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px" @click="modalOpen = true">
            从弹窗填写联系人
          </button>
        </FormProvider>
      </div>
      <div style="flex: 1; border: 1px solid #e4e7ed; border-radius: 4px; padding: 16px">
        <h4 style="margin: 0 0 12px">子表单 - 联系人</h4>
        <FormProvider :form="subForm">
          <FormField v-for="n in ['contactName', 'contactPhone', 'contactEmail']" :key="n" v-slot="{ field }" :name="n">
            <div style="margin-bottom: 18px">
              <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
                <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
              </label>
              <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" @blur="field.blur(); field.validate('blur').catch(() => {})" />
              <div v-if="field.errors[0]?.message" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                {{ field.errors[0]?.message }}
              </div>
            </div>
          </FormField>
        </FormProvider>
      </div>
    </div>
    <button type="button" style="margin-top: 16px; padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px" @click="jointSubmit">
      联合提交
    </button>
    <!-- 弹窗 -->
    <div v-if="modalOpen" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000" @click.self="modalOpen = false">
      <div style="background: #fff; border-radius: 8px; padding: 24px; min-width: 500px; max-width: 90vw; box-shadow: 0 2px 12px rgba(0,0,0,0.15)">
        <h3 style="margin: 0 0 16px">编辑联系人</h3>
        <FormProvider :form="subForm">
          <FormField v-for="n in ['contactName', 'contactPhone', 'contactEmail']" :key="n" v-slot="{ field }" :name="n">
            <div style="margin-bottom: 18px">
              <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
              <input :value="(field.value as string) ?? ''" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
            </div>
          </FormField>
        </FormProvider>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="modalOpen = false">
            取消
          </button>
          <button type="button" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px" @click="modalOk">
            确定
          </button>
        </div>
      </div>
    </div>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <strong>联合提交结果</strong>
      <div style="margin-top: 4px; white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
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
