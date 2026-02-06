<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Element Plus Transfer / 权限分配 / 搜索过滤</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="roleName"><el-form-item :label="field.label" :required="field.required"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></el-form-item></FormField>
        <el-form-item label="权限分配">
          <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px"><el-tag v-for="k in targetKeys" :key="k" type="primary">{{ PERMISSIONS.find(p => p.key === k)?.label ?? k }}</el-tag></div>
          <el-transfer v-else v-model="targetKeys" :data="PERMISSIONS" :titles="['可选权限', '已选权限']" :button-texts="['移除', '添加']" :disabled="mode === 'disabled'" filterable :filter-method="(query: string, item: any) => item.label.includes(query)" />
        </el-form-item>
        <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElTransfer, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, label: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}` }))
const targetKeys = ref(['perm-1', 'perm-3', 'perm-5'])
const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } })
onMounted(() => { form.createField({ name: 'roleName', label: '角色名称', required: true }); form.createField({ name: 'permissions', label: '权限', required: true }); watch(targetKeys, (keys) => { form.setFieldValue('permissions', keys) }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
