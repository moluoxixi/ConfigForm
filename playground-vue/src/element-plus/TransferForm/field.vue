<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Element Plus Transfer / 权限分配 / 搜索过滤
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="roleName">
          <ElFormItem :label="field.label" :required="field.required">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <ElFormItem label="权限分配">
          <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px">
            <ElTag v-for="k in targetKeys" :key="k" type="primary">
              {{ PERMISSIONS.find(p => p.key === k)?.label ?? k }}
            </ElTag>
          </div>
          <ElTransfer v-else v-model="targetKeys" :data="PERMISSIONS" :titles="['可选权限', '已选权限']" :button-texts="['移除', '添加']" :disabled="mode === 'disabled'" filterable :filter-method="(query: string, item: any) => item.label.includes(query)" />
        </ElFormItem>
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
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElTag, ElTransfer } from 'element-plus'
import { onMounted, ref, watch } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, label: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}` }))
const targetKeys = ref(['perm-1', 'perm-3', 'perm-5'])
const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } })
onMounted(() => {
  form.createField({ name: 'roleName', label: '角色名称', required: true })
  form.createField({ name: 'permissions', label: '权限', required: true })
  watch(targetKeys, (keys) => {
    form.setFieldValue('permissions', keys)
  })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
