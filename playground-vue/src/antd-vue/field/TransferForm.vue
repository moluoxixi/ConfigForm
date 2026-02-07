<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Transfer / 权限分配 / 搜索过滤</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="roleName"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <AFormItem label="权限分配">
          <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px"><ATag v-for="k in targetKeys" :key="k" color="blue">{{ PERMISSIONS.find(p => p.key === k)?.title ?? k }}</ATag></div>
          <ATransfer v-else :data-source="PERMISSIONS" :target-keys="targetKeys" :render="(item: any) => item.title" show-search :list-style="{ width: '320px', height: '340px' }" :titles="['可选权限', '已选权限']" :disabled="mode === 'disabled'" :filter-option="(input: string, item: any) => item.title.includes(input)" @change="handleTransferChange" />
        </AFormItem>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Transfer as ATransfer, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, title: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}` }))
const targetKeys = ref(['perm-1', 'perm-3', 'perm-5'])
const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } })
watch(mode, (v) => { form.pattern = v })
onMounted(() => { form.createField({ name: 'roleName', label: '角色名称', required: true }); form.createField({ name: 'permissions', label: '权限', required: true }) })
function handleTransferChange(keys: string[]): void { targetKeys.value = keys; form.setFieldValue('permissions', keys) }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
