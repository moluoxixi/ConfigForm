<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd TreeSelect / 单选+多选 / 组织树结构
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="memberName">
          <AFormItem :label="field.label">
            <AInput :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="department">
          <AFormItem :label="field.label">
            <ATag v-if="mode === 'readOnly'" color="blue">
              {{ field.value ?? '—' }}
            </ATag><ATreeSelect v-else :value="(field.value as string)" :tree-data="TREE" placeholder="请选择部门" style="width: 300px" tree-default-expand-all :disabled="mode === 'disabled'" @change="(v: string) => field.setValue(v)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="accessDepts">
          <AFormItem :label="field.label">
            <ASpace v-if="mode === 'readOnly'" wrap>
              <ATag v-for="v in ((field.value as string[]) ?? [])" :key="v" color="green">
                {{ v }}
              </ATag>
            </ASpace><ATreeSelect v-else :value="(field.value as string[]) ?? []" :tree-data="TREE" placeholder="多选可访问部门" style="width: 100%" tree-default-expand-all tree-checkable :disabled="mode === 'disabled'" @change="(v: string[]) => field.setValue(v)" />
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
import { FormItem as AFormItem, Input as AInput, Space as ASpace, Tag as ATag, TreeSelect as ATreeSelect } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
const TREE = [{ title: '总公司', value: 'root', children: [{ title: '技术中心', value: 'tech', children: [{ title: '前端组', value: 'frontend' }, { title: '后端组', value: 'backend' }] }, { title: '产品中心', value: 'product', children: [{ title: '产品设计', value: 'pd' }, { title: '用户研究', value: 'ux' }] }] }]
const form = useCreateForm({ initialValues: { memberName: '', department: undefined, accessDepts: [] } })
onMounted(() => {
  form.createField({ name: 'memberName', label: '成员姓名', required: true })
  form.createField({ name: 'department', label: '所属部门', required: true })
  form.createField({ name: 'accessDepts', label: '可访问部门' })
})
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
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
