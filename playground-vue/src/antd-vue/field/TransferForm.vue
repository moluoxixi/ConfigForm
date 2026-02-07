<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Transfer / 权限分配 / 搜索过滤</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="roleName"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <AFormItem label="权限分配">
          <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px"><ATag v-for="k in targetKeys" :key="k" color="blue">{{ PERMISSIONS.find(p => p.key === k)?.title ?? k }}</ATag></div>
          <ATransfer v-else :data-source="PERMISSIONS" :target-keys="targetKeys" :render="(item: any) => item.title" show-search :list-style="{ width: '320px', height: '340px' }" :titles="['可选权限', '已选权限']" :disabled="mode === 'disabled'" :filter-option="(input: string, item: any) => item.title.includes(input)" @change="handleTransferChange" />
        </AFormItem>
      </template>
    </PlaygroundForm>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Input as AInput, FormItem as AFormItem, Transfer as ATransfer, Tag as ATag } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, title: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}` }))
const targetKeys = ref(['perm-1', 'perm-3', 'perm-5'])
const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } })
onMounted(() => { form.createField({ name: 'roleName', label: '角色名称', required: true }); form.createField({ name: 'permissions', label: '权限', required: true }) })
function handleTransferChange(keys: string[]): void { targetKeys.value = keys; form.setFieldValue('permissions', keys) }
</script>
