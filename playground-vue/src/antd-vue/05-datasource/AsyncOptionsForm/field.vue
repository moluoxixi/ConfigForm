<template>
  <div>
    <h2>异步选项加载（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      远程 dataSource / reactions 异步加载 / loading 状态 - FormField + fieldProps 实现
    </p>
    <div style="padding: 8px 16px; margin-bottom: 16px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 6px; font-size: 13px">切换「类型」下拉可看到异步加载过程（模拟 600ms 延迟）</div>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="dynamicType" :field-props="{ label: '类型', component: 'Select', dataSource: TYPE_OPTIONS, componentProps: { placeholder: '请选择类型' } }" />
          <FormField name="dynamicItem" :field-props="{ label: '品种（异步）', component: 'Select', componentProps: { placeholder: '加载中...' } }" />
          <FormField name="country" :field-props="{ label: '国家', component: 'Select', dataSource: COUNTRY_OPTIONS, componentProps: { placeholder: '请选择国家' } }" />
          <FormField name="remark" :field-props="{ label: '备注', component: 'Textarea', componentProps: { placeholder: '请输入' } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 类型选项 */
const TYPE_OPTIONS = [
  { label: '水果', value: 'fruit' },
  { label: '蔬菜', value: 'vegetable' },
  { label: '肉类', value: 'meat' },
]

/** 国家选项 */
const COUNTRY_OPTIONS = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
]

/** 模拟异步数据：品种选项（按类型分组） */
const MOCK_DATA: Record<string, Array<{ label: string; value: string }>> = {
  fruit: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }, { label: '橙子', value: 'orange' }],
  vegetable: [{ label: '白菜', value: 'cabbage' }, { label: '胡萝卜', value: 'carrot' }],
  meat: [{ label: '猪肉', value: 'pork' }, { label: '牛肉', value: 'beef' }],
}

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { dynamicType: 'fruit', dynamicItem: undefined, country: 'china', remark: '' },
})

/** 监听「类型」变化，异步加载品种选项（模拟 600ms 延迟） */
form.onFieldValueChange('dynamicType', async (value: unknown) => {
  const field = form.getField('dynamicItem')
  if (!field) return
  const t = value as string
  if (!t) {
    field.setDataSource([])
    field.setComponentProps({ placeholder: '请先选择类型' })
    return
  }
  field.loading = true
  field.setValue(undefined)
  field.setComponentProps({ placeholder: '加载中...' })
  await new Promise<void>(r => setTimeout(r, 600))
  field.setDataSource(MOCK_DATA[t] ?? [])
  field.loading = false
  const count = (MOCK_DATA[t] ?? []).length
  field.setComponentProps({ placeholder: `请选择品种（${count}项）` })
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
