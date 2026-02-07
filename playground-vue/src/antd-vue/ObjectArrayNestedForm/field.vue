<template>
  <div>
    <h2>对象数组嵌套</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      联系人数组 → 每人含嵌套电话数组 — FormField + FormArrayField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }" result-title="提交结果（嵌套结构）">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="teamName" :field-props="{ label: '团队名称', required: true, component: 'Input', componentProps: { style: 'width: 300px' } }" />
          <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 10, itemTemplate: () => ({ name: '', role: '', phones: [{ number: '', label: '手机' }] }) }">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px">
                <span style="font-weight: 600">团队成员 ({{ ((arrayField.value as unknown[]) ?? []).length }}/10)</span>
                <AButton v-if="mode === 'editable'" type="primary" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', role: '', phones: [{ number: '', label: '手机' }] })">
                  添加联系人
                </AButton>
              </div>
              <ACard v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" size="small" :title="`联系人 #${idx + 1}`" style="margin-bottom: 12px">
                <template v-if="mode === 'editable'" #extra>
                  <AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删除</AButton>
                </template>
                <ASpace>
                  <FormField :name="`contacts.${idx}.name`" :field-props="{ component: 'Input', componentProps: { placeholder: '姓名', addonBefore: '姓名' } }" />
                  <FormField :name="`contacts.${idx}.role`" :field-props="{ component: 'Input', componentProps: { placeholder: '角色', addonBefore: '角色' } }" />
                </ASpace>
                <!-- 嵌套电话数组 -->
                <FormArrayField v-slot="{ arrayField: phoneArray }" :name="`contacts.${idx}.phones`" :field-props="{ minItems: 1, maxItems: 5, itemTemplate: () => ({ number: '', label: '手机' }) }">
                  <div style="padding: 8px 12px; background: #fafafa; border-radius: 4px; margin-top: 8px">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                      <span style="color: #999; font-size: 12px">电话列表 ({{ ((phoneArray.value as unknown[]) ?? []).length }}/5)</span>
                      <AButton v-if="mode === 'editable'" size="small" type="dashed" :disabled="!phoneArray.canAdd" @click="phoneArray.push({ number: '', label: '手机' })">
                        添加电话
                      </AButton>
                    </div>
                    <ASpace v-for="(__, pIdx) in ((phoneArray.value as unknown[]) ?? [])" :key="pIdx" :size="4" style="width: 100%; margin-bottom: 4px">
                      <FormField :name="`contacts.${idx}.phones.${pIdx}.label`" :field-props="{ component: 'Input', componentProps: { placeholder: '标签', size: 'small', style: 'width: 80px' } }" />
                      <FormField :name="`contacts.${idx}.phones.${pIdx}.number`" :field-props="{ component: 'Input', componentProps: { placeholder: '号码', size: 'small', style: 'width: 180px' } }" />
                      <AButton v-if="mode === 'editable'" size="small" danger :disabled="!phoneArray.canRemove" @click="phoneArray.remove(pIdx)">删</AButton>
                    </ASpace>
                  </div>
                </FormArrayField>
              </ACard>
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
 * 对象数组嵌套 — Field 模式
 *
 * 使用 FormProvider + FormField + FormArrayField 实现二级嵌套数组。
 * 联系人数组中每个联系人包含一个嵌套的电话数组。
 * 所有字段通过 fieldProps 声明式渲染，框架自动处理三种模式。
 */
import { Button as AButton, Card as ACard, Space as ASpace } from 'ant-design-vue'
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
