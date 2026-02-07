<template>
  <div>
    <h2>Effects ??????/h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ?? createForm({ effects }) ?????????? onFieldValueChange / onValuesChange ??????????    </p>

    <StatusTabs ref="st" v-slot="{ mode, showResult }">
    <div style="display: flex; gap: 16px;">
      <div style="flex: 1;">
        <FormProvider :form="form">
          <FormField name="unitPrice" :field-props="{ label: '??', component: 'InputNumber', componentProps: { min: 0 } }" />
          <FormField name="quantity" :field-props="{ label: '??', component: 'InputNumber', componentProps: { min: 1 } }" />
          <FormField name="totalPrice" :field-props="{ label: '????????', component: 'InputNumber', disabled: true }" />
          <FormField name="discount" :field-props="{ label: '??(%)', component: 'InputNumber', componentProps: { min: 0, max: 100 } }" />
          <FormField name="finalPrice" :field-props="{ label: '?????????', component: 'InputNumber', disabled: true }" />
          <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
            <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">??</button>
            <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">??</button>
          </div>
        </FormProvider>
      </div>
      <div style="width: 320px; border: 1px solid #eee; border-radius: 8px; padding: 12px; background: #fafafa; max-height: 500px; overflow: auto;">
        <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Effects ??</div>
        <div v-for="(log, i) in logs" :key="i" style="font-size: 12px; color: #666; border-bottom: 1px solid #f0f0f0; padding: 4px 0;">
          <span style="color: #1677ff;">[{{ log.type }}]</span> {{ log.message }}
        </div>
        <div v-if="logs.length === 0" style="color: #999; font-size: 12px;">????...</div>
      </div>
    </div>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * ?? 50?Effects ??????Ant Design Vue?? *
 * ?? createForm ??effects ???? * - onValuesChange????????? * - onFieldValueChange??????????????
 * - ?? setFieldValue ???????? */
import { reactive, ref, watch } from 'vue'
import { createForm } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormProvider, FormField } from '@moluoxixi/vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const logs = reactive<Array<{ type: string; message: string }>>([])

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
    /* ????????*/
    f.onValuesChange(() => {
      addLog('values', `?????? ${JSON.stringify(f.values).slice(0, 80)}...`)
    })

    /* ?????? ?????? */
    f.onFieldValueChange('unitPrice', (val) => {
      addLog('field', `???? ${val}`)
      const qty = f.getFieldValue('quantity') as number ?? 0
      f.setFieldValue('totalPrice', (val as number ?? 0) * qty)
    })

    /* ?????? ?????? */
    f.onFieldValueChange('quantity', (val) => {
      addLog('field', `???? ${val}`)
      const price = f.getFieldValue('unitPrice') as number ?? 0
      f.setFieldValue('totalPrice', price * (val as number ?? 0))
    })

    /* ????????????????? */
    f.onFieldValueChange('totalPrice', (val) => {
      addLog('field', `???? ${val}`)
      const discount = f.getFieldValue('discount') as number ?? 0
      f.setFieldValue('finalPrice', (val as number ?? 0) * (1 - discount / 100))
    })

    f.onFieldValueChange('discount', (val) => {
      addLog('field', `???? ${val}%`)
      const total = f.getFieldValue('totalPrice') as number ?? 0
      f.setFieldValue('finalPrice', total * (1 - (val as number ?? 0) / 100))
    })
  },
})

/** ?? StatusTabs ? mode ? form.pattern */
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })

/** ???? */
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
