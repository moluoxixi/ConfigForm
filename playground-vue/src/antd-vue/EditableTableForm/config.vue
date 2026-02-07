<template>
  <div>
    <h2>可编辑表格</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">表格行内编辑 / 行级联动 / 列统计</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormArrayField v-slot="{ arrayField }" name="items" :field-props="{ minItems: 1, maxItems: 20, itemTemplate: () => ({ productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }) }">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span style="font-weight: 600">订单明细 ({{ ((arrayField.value as unknown[]) ?? []).length }}/20)</span>
              <AButton v-if="mode === 'editable'" type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push({ productName: '', quantity: 1, unitPrice: 0, subtotal: 0 })">添加行</AButton>
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #f0f0f0">
              <thead><tr style="background: #fafafa"><th style="padding: 8px; width: 50px">#</th><th style="padding: 8px">商品</th><th style="padding: 8px; width: 120px">数量</th><th style="padding: 8px; width: 140px">单价</th><th style="padding: 8px; width: 100px; text-align: right">小计</th><th v-if="mode === 'editable'" style="padding: 8px; width: 60px">操作</th></tr></thead>
              <tbody>
                <tr v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" style="border-bottom: 1px solid #f0f0f0">
                  <td style="padding: 6px 8px; text-align: center; color: #999">{{ idx + 1 }}</td>
                  <td style="padding: 6px 8px"><FormField v-slot="{ field }" :name="`items.${idx}.productName`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="商品" size="small" :disabled="mode === 'disabled'" /></FormField></td>
                  <td style="padding: 6px 8px"><FormField v-slot="{ field }" :name="`items.${idx}.quantity`"><span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number) ?? 1" @update:value="(v: number | null) => { field.setValue(v ?? 1); form.setFieldValue(`items.${idx}.subtotal`, (v ?? 1) * ((form.getFieldValue(`items.${idx}.unitPrice`) as number) ?? 0)) }" :min="1" size="small" style="width: 100%" :disabled="mode === 'disabled'" /></FormField></td>
                  <td style="padding: 6px 8px"><FormField v-slot="{ field }" :name="`items.${idx}.unitPrice`"><span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number) ?? 0" @update:value="(v: number | null) => { field.setValue(v ?? 0); form.setFieldValue(`items.${idx}.subtotal`, ((form.getFieldValue(`items.${idx}.quantity`) as number) ?? 0) * (v ?? 0)) }" :min="0" :step="0.01" size="small" style="width: 100%" :disabled="mode === 'disabled'" /></FormField></td>
                  <td style="padding: 6px 8px; text-align: right"><FormField v-slot="{ field }" :name="`items.${idx}.subtotal`"><strong style="color: #52c41a">¥{{ ((field.value as number) ?? 0).toFixed(2) }}</strong></FormField></td>
                  <td v-if="mode === 'editable'" style="padding: 6px 8px; text-align: center"><AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删</AButton></td>
                </tr>
              </tbody>
              <tfoot><tr style="background: #f6ffed; border-top: 2px solid #52c41a"><td :colspan="mode === 'editable' ? 4 : 4" style="padding: 8px; text-align: right; font-weight: 600">合计：</td><td style="padding: 8px; text-align: right" :colspan="mode === 'editable' ? 2 : 1"><strong style="font-size: 16px; color: #52c41a">¥{{ getTotal().toFixed(2) }}</strong></td></tr></tfoot>
            </table>
          </div>
        </FormArrayField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Input as AInput, InputNumber as AInputNumber } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({ initialValues: { items: [{ productName: '键盘', quantity: 2, unitPrice: 299, subtotal: 598 }, { productName: '鼠标', quantity: 3, unitPrice: 99, subtotal: 297 }] } })
function getTotal(): number { const items = (form.getFieldValue('items') ?? []) as Array<{ subtotal?: number }>; return items.reduce((s, i) => s + (i?.subtotal ?? 0), 0) }
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}
</script>
