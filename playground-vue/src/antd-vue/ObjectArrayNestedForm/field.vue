<template>
  <div>
    <h2>对象数组嵌套（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      联系人数组 → 每人含嵌套电话数组 — FormArrayField 自动渲染
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <FormField name="teamName" :field-props="{ label: '团队名称', required: true, component: 'Input', componentProps: { placeholder: '请输入团队名称', style: 'width: 300px' } }" />
          <!-- FormArrayField 自动渲染嵌套数组，无需 v-for -->
          <FormArrayField name="contacts" :field-props="{
            label: '团队成员',
            minItems: 1,
            maxItems: 10,
            itemTemplate: () => ({ name: '', role: '', phones: [{ number: '', label: '手机' }] }),
          }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 对象数组嵌套 — Field 模式（Ant Design Vue）
 *
 * 使用 FormProvider + FormArrayField 嵌套实现多层数组结构。
 * FormArrayField 自动检测 itemTemplate 中的数组属性并递归渲染。
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    teamName: '开发团队',
    contacts: [
      { name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] },
      { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] },
    ],
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
