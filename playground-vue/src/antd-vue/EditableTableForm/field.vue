<template>
  <div>
    <h2>可编辑表格</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      表格行内编辑 / 行级联动 / 列统计 — FormField + FormArrayField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormArrayField v-slot="{ arrayField }" name="items" :field-props="{ minItems: 1, maxItems: 20, itemTemplate: () => ({ productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }) }">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                <span style="font-weight: 600">订单明细 ({{ ((arrayField.value as unknown[]) ?? []).length }}/20)</span>
                <button style="background: #1677ff; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px" :disabled="!arrayField.canAdd" @click="arrayField.push({ productName: '', quantity: 1, unitPrice: 0, subtotal: 0 })">
                  添加行
                </button>
              </div>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #f0f0f0">
                <thead>
                  <tr style="background: #fafafa">
                    <th style="padding: 8px; width: 50px">#</th>
                    <th style="padding: 8px">商品</th>
                    <th style="padding: 8px; width: 120px">数量</th>
                    <th style="padding: 8px; width: 140px">单价</th>
                    <th style="padding: 8px; width: 100px; text-align: right">小计</th>
                    <th style="padding: 8px; width: 60px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" style="border-bottom: 1px solid #f0f0f0">
                    <td style="padding: 6px 8px; text-align: center; color: #999">{{ idx + 1 }}</td>
                    <td style="padding: 6px 8px">
                      <FormField :name="`items.${idx}.productName`" :field-props="{ component: 'Input', componentProps: { placeholder: '商品', size: 'small' } }" />
                    </td>
                    <td style="padding: 6px 8px">
                      <FormField :name="`items.${idx}.quantity`" :field-props="{ component: 'InputNumber', componentProps: { min: 1, size: 'small', style: 'width: 100%', onChange: (v: number | null) => recalcSubtotal(idx, v ?? 1, null) } }" />
                    </td>
                    <td style="padding: 6px 8px">
                      <FormField :name="`items.${idx}.unitPrice`" :field-props="{ component: 'InputNumber', componentProps: { min: 0, step: 0.01, size: 'small', style: 'width: 100%', onChange: (v: number | null) => recalcSubtotal(idx, null, v ?? 0) } }" />
                    </td>
                    <td style="padding: 6px 8px; text-align: right">
                      <FormField :name="`items.${idx}.subtotal`" :field-props="{ component: 'InputNumber', componentProps: { controls: false, bordered: false, readOnly: true, formatter: (v: string | number | undefined) => `¥${Number(v ?? 0).toFixed(2)}`, parser: (v: string | undefined) => (v ?? '').replace(/[¥,]/g, ''), style: 'font-weight: bold; color: #52c41a; width: 100%; text-align: right; background: transparent; cursor: default' } }" />
                    </td>
                    <td style="padding: 6px 8px; text-align: center">
                      <button style="color: #ff4d4f; border: 1px solid #ff4d4f; background: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px" :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="background: #f6ffed; border-top: 2px solid #52c41a">
                    <td colspan="4" style="padding: 8px; text-align: right; font-weight: 600">合计：</td>
                    <td colspan="2" style="padding: 8px; text-align: right">
                      <strong style="font-size: 16px; color: #52c41a">¥{{ getTotal().toFixed(2) }}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </FormArrayField>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 可编辑表格 — Field 模式
 *
 * 使用 FormProvider + FormField + FormArrayField 实现表格行内编辑。
 * 数量/单价通过 componentProps.onChange 触发小计重算，底部显示合计行。
 * 所有字段通过 fieldProps 声明式渲染，框架自动处理三种模式。
 */
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    items: [
      { productName: '键盘', quantity: 2, unitPrice: 299, subtotal: 598 },
      { productName: '鼠标', quantity: 3, unitPrice: 99, subtotal: 297 },
    ],
  },
})

/** 重算指定行的小计金额 */
function recalcSubtotal(idx: number, qty: number | null, price: number | null): void {
  const q = qty ?? ((form.getFieldValue(`items.${idx}.quantity`) as number) ?? 0)
  const p = price ?? ((form.getFieldValue(`items.${idx}.unitPrice`) as number) ?? 0)
  form.setFieldValue(`items.${idx}.subtotal`, q * p)
}

/** 计算合计金额 */
function getTotal(): number {
  const items = (form.getFieldValue('items') ?? []) as Array<{ subtotal?: number }>
  return items.reduce((s, i) => s + (i?.subtotal ?? 0), 0)
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
