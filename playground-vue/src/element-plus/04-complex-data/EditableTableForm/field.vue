<template>
  <div>
    <h2>可编辑表格（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      表格行内编辑 / 行级联动 / 列统计 — FormField + FormArrayField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormArrayField v-slot="{ arrayField }" name="items" :field-props="{ minItems: 1, maxItems: 20, itemTemplate: () => ({ productName: '', quantity: 1, unitPrice: 0 }) }">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                <span style="font-weight: 600">订单明细 ({{ ((arrayField.value as unknown[]) ?? []).length }}/20)</span>
                <el-button type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push({ productName: '', quantity: 1, unitPrice: 0 })">
                  添加行
                </el-button>
              </div>
              <el-table :data="(arrayField.value as unknown[]) ?? []" border style="width: 100%">
                <el-table-column type="index" label="#" width="50" />
                <el-table-column label="商品" min-width="150">
                  <template #default="{ $index }">
                    <FormField :name="`items.${$index}.productName`" :field-props="{ component: 'Input', componentProps: { placeholder: '商品', size: 'small' } }" />
                  </template>
                </el-table-column>
                <el-table-column label="数量" width="120">
                  <template #default="{ $index }">
                    <FormField :name="`items.${$index}.quantity`" :field-props="{ component: 'InputNumber', componentProps: { min: 1, size: 'small', style: 'width: 100%' } }" />
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="140">
                  <template #default="{ $index }">
                    <FormField :name="`items.${$index}.unitPrice`" :field-props="{ component: 'InputNumber', componentProps: { min: 0, step: 0.01, size: 'small', style: 'width: 100%' } }" />
                  </template>
                </el-table-column>
                <el-table-column label="小计" width="100" align="right">
                  <template #default="{ row }">
                    <strong style="color: #67c23a">¥{{ ((row.quantity ?? 0) * (row.unitPrice ?? 0)).toFixed(2) }}</strong>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button size="small" type="danger" :disabled="!arrayField.canRemove" @click="arrayField.remove($index)">
                      删
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div style="margin-top: 8px; text-align: right; font-weight: 600">
                合计：<strong style="font-size: 16px; color: #67c23a">¥{{ getTotal(arrayField.value as any[]).toFixed(2) }}</strong>
              </div>
            </div>
          </FormArrayField>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 可编辑表格 — Field 模式（Element Plus）
 *
 * 使用 FormProvider + FormArrayField + ElTable 实现可编辑表格。
 */
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    items: [
      { productName: '键盘', quantity: 2, unitPrice: 299 },
      { productName: '鼠标', quantity: 3, unitPrice: 99 },
    ],
  },
})

function getTotal(items: Array<{ quantity?: number, unitPrice?: number }>): number {
  return (items ?? []).reduce((s, i) => s + (i?.quantity ?? 0) * (i?.unitPrice ?? 0), 0)
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
