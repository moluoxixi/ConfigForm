<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      format / parse / transform / submitPath
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-for="name in FIELDS" :key="name" v-slot="{ field }" :name="name">
          <AFormItem :label="field.label" :help="field.description">
            <ASpace>
              <span v-if="mode === 'readOnly'">{{ String(field.value ?? '') || '—' }}</span><AInput v-else :value="String(field.value ?? '')" :disabled="mode === 'disabled'" style="width: 300px" @update:value="field.setValue($event)" /><ATag color="blue">
                原始: {{ JSON.stringify(field.value) }}
              </ATag>
            </ASpace>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { FormItem as AFormItem, Input as AInput, Space as ASpace, Tag as ATag } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const FIELDS = ['priceCent', 'phoneRaw', 'fullName', 'tags']
const form = useCreateForm({ initialValues: { priceCent: 9990, phoneRaw: '13800138000', fullName: '张三', tags: 'react,vue,typescript' } })

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

onMounted(() => {
  form.createField({ name: 'priceCent', label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '', parse: (v: unknown) => Math.round(Number(v) * 100) })
  form.createField({ name: 'phoneRaw', label: '手机号（脱敏）', format: (v: unknown) => {
    const s = String(v ?? '')
    return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s
  } })
  form.createField({ name: 'fullName', label: '姓名' })
  form.createField({ name: 'tags', label: '标签（逗号分隔）', description: '提交时转为数组', transform: (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean) })
})
</script>
