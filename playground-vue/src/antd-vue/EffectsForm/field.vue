<template>
  <div>
    <h2>Effects 副作用联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      createForm({ effects }) 实现字段联动计算 — Field 模式
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <div style="display: flex; gap: 16px">
        <div style="flex: 1">
          <FormProvider :form="form">
            <form @submit.prevent="handleSubmit(showResult)" novalidate>
              <FormField name="unitPrice" :field-props="{ label: '单价', component: 'InputNumber', componentProps: { min: 0 } }" />
              <FormField name="quantity" :field-props="{ label: '数量', component: 'InputNumber', componentProps: { min: 1 } }" />
              <FormField name="totalPrice" :field-props="{ label: '总价（自动计算）', component: 'InputNumber', disabled: true }" />
              <FormField name="discount" :field-props="{ label: '折扣(%)', component: 'InputNumber', componentProps: { min: 0, max: 100 } }" />
              <FormField name="finalPrice" :field-props="{ label: '实付（自动计算）', component: 'InputNumber', disabled: true }" />
              <LayoutFormActions @reset="form.reset()" />
            </form>
          </FormProvider>
        </div>
        <!-- Effects 日志面板 -->
        <div style="width: 320px; border: 1px solid #eee; border-radius: 8px; padding: 12px; background: #fafafa; max-height: 500px; overflow: auto">
          <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px">Effects 日志</div>
          <div v-for="(log, i) in logs" :key="i" style="font-size: 12px; color: #666; border-bottom: 1px solid #f0f0f0; padding: 4px 0">
            <span style="color: #1677ff">[{{ log.type }}]</span> {{ log.message }}
          </div>
          <div v-if="logs.length === 0" style="color: #999; font-size: 12px">等待操作...</div>
        </div>
      </div>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { createForm } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider } from '@moluoxixi/vue'
/**
 * Effects 副作用联动 — Field 模式
 *
 * 使用 createForm + effects 实现字段间自动联动计算。
 * onFieldValueChange 监听单价/数量/折扣变化，自动计算总价和实付金额。
 */
import { reactive, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

/** Effects 日志 */
const logs = reactive<Array<{ type: string; message: string }>>([])

/** 添加一条日志 */
function addLog(type: string, message: string): void {
  logs.unshift({ type, message })
  if (logs.length > 50) logs.pop()
}

const form = createForm({
  initialValues: {
    unitPrice: 100,
    quantity: 1,
    totalPrice: 100,
    discount: 0,
    finalPrice: 100,
  },
  effects: (f) => {
    /* 监听所有值变化 */
    f.onValuesChange(() => {
      addLog('values', `表单值变化 ${JSON.stringify(f.values).slice(0, 80)}...`)
    })

    /* 单价变化 → 重算总价 */
    f.onFieldValueChange('unitPrice', (val) => {
      addLog('field', `单价→ ${val}`)
      const qty = f.getFieldValue('quantity') as number ?? 0
      f.setFieldValue('totalPrice', (val as number ?? 0) * qty)
    })

    /* 数量变化 → 重算总价 */
    f.onFieldValueChange('quantity', (val) => {
      addLog('field', `数量→ ${val}`)
      const price = f.getFieldValue('unitPrice') as number ?? 0
      f.setFieldValue('totalPrice', price * (val as number ?? 0))
    })

    /* 总价变化 → 重算实付 */
    f.onFieldValueChange('totalPrice', (val) => {
      addLog('field', `总价→ ${val}`)
      const discount = f.getFieldValue('discount') as number ?? 0
      f.setFieldValue('finalPrice', (val as number ?? 0) * (1 - discount / 100))
    })

    /* 折扣变化 → 重算实付 */
    f.onFieldValueChange('discount', (val) => {
      addLog('field', `折扣→ ${val}%`)
      const total = f.getFieldValue('totalPrice') as number ?? 0
      f.setFieldValue('finalPrice', total * (1 - (val as number ?? 0) / 100))
    })
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
