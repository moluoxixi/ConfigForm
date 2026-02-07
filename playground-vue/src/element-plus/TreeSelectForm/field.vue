<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Element Plus TreeSelect / 单选+多选 / 组织树结构
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="memberName">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="department">
          <ElFormItem :label="field.label">
            <ElTag v-if="mode === 'readOnly'" type="primary">
              {{ field.value ?? '—' }}
            </ElTag><ElTreeSelect v-else :model-value="(field.value as string)" :data="TREE" placeholder="请选择部门" style="width: 300px" default-expand-all :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="accessDepts">
          <ElFormItem :label="field.label">
            <ElSpace v-if="mode === 'readOnly'" wrap>
              <ElTag v-for="v in ((field.value as string[]) ?? [])" :key="v" type="success">
                {{ v }}
              </ElTag>
            </ElSpace><ElTreeSelect v-else :model-value="(field.value as string[]) ?? []" :data="TREE" placeholder="多选可访问部门" style="width: 100%" default-expand-all multiple :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElTag, ElTreeSelect } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const TREE = [{ label: '总公司', value: 'root', children: [{ label: '技术中心', value: 'tech', children: [{ label: '前端组', value: 'frontend' }, { label: '后端组', value: 'backend' }] }, { label: '产品中心', value: 'product', children: [{ label: '产品设计', value: 'pd' }, { label: '用户研究', value: 'ux' }] }] }]
const form = useCreateForm({ initialValues: { memberName: '', department: undefined, accessDepts: [] } })
onMounted(() => {
  form.createField({ name: 'memberName', label: '成员姓名', required: true })
  form.createField({ name: 'department', label: '所属部门', required: true })
  form.createField({ name: 'accessDepts', label: '可访问部门' })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
