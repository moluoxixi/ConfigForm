<template>
  <div>
    <h2>对象数组嵌套</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">联系人数组 → 每人含嵌套电话数组</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="teamName"><el-form-item :label="field.label" :required="field.required"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" style="width: 300px" :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 10, itemTemplate: () => ({ name: '', role: '', phones: [{ number: '', label: '手机' }] }) }">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px">
              <span style="font-weight: 600">团队成员 ({{ ((arrayField.value as unknown[]) ?? []).length }}/10)</span>
              <el-button v-if="mode === 'editable'" type="primary" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', role: '', phones: [{ number: '', label: '手机' }] })">添加联系人</el-button>
            </div>
            <el-card v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" shadow="never" :header="`联系人 #${idx + 1}`" style="margin-bottom: 12px">
              <template v-if="mode === 'editable'" #header><div style="display: flex; justify-content: space-between; align-items: center"><span>联系人 #{{ idx + 1 }}</span><el-button size="small" type="danger" :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删除</el-button></div></template>
              <el-space>
                <FormField v-slot="{ field }" :name="`contacts.${idx}.name`"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="姓名" :disabled="mode === 'disabled'"><template #prepend>姓名</template></el-input></FormField>
                <FormField v-slot="{ field }" :name="`contacts.${idx}.role`"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="角色" :disabled="mode === 'disabled'"><template #prepend>角色</template></el-input></FormField>
              </el-space>
              <FormArrayField v-slot="{ arrayField: phoneArray }" :name="`contacts.${idx}.phones`" :field-props="{ minItems: 1, maxItems: 5, itemTemplate: () => ({ number: '', label: '手机' }) }">
                <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; margin-top: 8px">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                    <span style="color: #909399; font-size: 12px">电话列表 ({{ ((phoneArray.value as unknown[]) ?? []).length }}/5)</span>
                    <el-button v-if="mode === 'editable'" size="small" :disabled="!phoneArray.canAdd" @click="phoneArray.push({ number: '', label: '手机' })">添加电话</el-button>
                  </div>
                  <el-space v-for="(__, pIdx) in ((phoneArray.value as unknown[]) ?? [])" :key="pIdx" :size="4" style="width: 100%; margin-bottom: 4px">
                    <FormField v-slot="{ field }" :name="`contacts.${idx}.phones.${pIdx}.label`"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="标签" size="small" style="width: 80px" :disabled="mode === 'disabled'" /></FormField>
                    <FormField v-slot="{ field }" :name="`contacts.${idx}.phones.${pIdx}.number`"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="号码" size="small" style="width: 180px" :disabled="mode === 'disabled'" /></FormField>
                    <el-button v-if="mode === 'editable'" size="small" type="danger" :disabled="!phoneArray.canRemove" @click="phoneArray.remove(pIdx)">删</el-button>
                  </el-space>
                </div>
              </FormArrayField>
            </el-card>
          </div>
        </FormArrayField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { teamName: '开发团队', contacts: [{ name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] }, { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] }] } })
onMounted(() => { form.createField({ name: 'teamName', label: '团队名称', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); if (res.errors.length > 0) { result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { result.value = JSON.stringify(res.values, null, 2) } }
</script>
