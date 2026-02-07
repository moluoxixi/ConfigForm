<template>
  <div>
    <h2>数组字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      增删 / 排序 / 复制 / min-max 数量限制 — FormField + FormArrayField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="groupName" :field-props="{ label: '分组名称', required: true, component: 'Input', componentProps: { placeholder: '请输入分组名称', style: 'width: 300px' } }" />
          <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 8, itemTemplate: () => ({ name: '', phone: '', email: '' }) }">
            <div style="margin-bottom: 16px">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                <span style="font-weight: 600">联系人列表 ({{ ((arrayField.value as unknown[]) ?? []).length }}/8)</span>
                <AButton v-if="mode === 'editable'" type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', phone: '', email: '' })">
                  添加
                </AButton>
              </div>
              <div v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" :style="{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: '8px', padding: '8px 12px', background: idx % 2 === 0 ? '#fafafa' : '#fff', borderRadius: '4px', alignItems: 'center' }">
                <span style="color: #999">#{{ idx + 1 }}</span>
                <FormField :name="`contacts.${idx}.name`" :field-props="{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small' } }" />
                <FormField :name="`contacts.${idx}.phone`" :field-props="{ component: 'Input', componentProps: { placeholder: '电话', size: 'small' } }" />
                <FormField :name="`contacts.${idx}.email`" :field-props="{ component: 'Input', componentProps: { placeholder: '邮箱', size: 'small' } }" />
                <ASpace v-if="mode === 'editable'" :size="4">
                  <AButton size="small" :disabled="idx === 0" @click="arrayField.moveUp(idx)">↑</AButton>
                  <AButton size="small" :disabled="idx === ((arrayField.value as unknown[]) ?? []).length - 1" @click="arrayField.moveDown(idx)">↓</AButton>
                  <AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删</AButton>
                </ASpace>
              </div>
            </div>
          </FormArrayField>
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 数组字段 — Field 模式
 *
 * 使用 FormProvider + FormField + FormArrayField 实现数组字段的增删排序。
 * fieldProps 配置 minItems/maxItems/itemTemplate 控制数量限制和新增模板。
 * 数组项字段通过 fieldProps 声明式渲染，框架自动处理三种模式。
 */
import { Button as AButton, Space as ASpace } from 'ant-design-vue'
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    groupName: '默认分组',
    contacts: [{ name: '', phone: '', email: '' }],
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
