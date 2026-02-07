<template>
  <div>
    <h2>动态增删字段</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">运行时添加/移除字段</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <el-card v-if="mode === 'editable'" shadow="never" header="添加新字段" style="margin-bottom: 16px">
      <el-space><el-input v-model="newLabel" placeholder="字段标签" style="width: 200px" /><el-select v-model="newType" style="width: 120px"><el-option label="文本" value="text" /><el-option label="数字" value="number" /><el-option label="选择" value="select" /></el-select><el-button type="primary" :disabled="!newLabel.trim()" @click="addField">添加</el-button></el-space>
      <div style="margin-top: 8px; color: #909399; font-size: 12px">已添加 {{ dynamicFields.length }} 个动态字段</div>
    </el-card>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="title"><el-form-item :label="field.label" :required="field.required"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" /></el-form-item></FormField>
        <FormField v-for="df in dynamicFields" :key="df.id" v-slot="{ field }" :name="df.name">
          <el-form-item :label="field.label">
            <el-space style="width: 100%">
              <el-select v-if="df.fieldType === 'select'" :model-value="(field.value as string)" @change="(v: string) => field.setValue(v)" placeholder="请选择" style="width: 200px" :disabled="mode === 'disabled'"><el-option label="A" value="a" /><el-option label="B" value="b" /><el-option label="C" value="c" /></el-select>
              <el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 200px" />
              <el-button v-if="mode === 'editable'" type="danger" @click="removeField(df.id)">删除</el-button>
            </el-space>
          </el-form-item>
        </FormField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const newLabel = ref('')
const newType = ref('text')
let counter = 0

interface DynField { id: string; name: string; label: string; fieldType: string }
const dynamicFields = ref<DynField[]>([])

const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => { form.createField({ name: 'title', label: '表单标题', required: true }) })

function addField(): void { if (!newLabel.value.trim()) return; counter++; const id = `dyn_${counter}`; form.createField({ name: id, label: newLabel.value.trim(), pattern: mode.value }); dynamicFields.value.push({ id, name: id, label: newLabel.value.trim(), fieldType: newType.value }); newLabel.value = '' }
function removeField(id: string): void { form.removeField(id); dynamicFields.value = dynamicFields.value.filter(f => f.id !== id) }
async function handleSubmit(): Promise<void> { const res = await form.submit(); if (res.errors.length > 0) { result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { result.value = JSON.stringify(res.values, null, 2) } }
</script>
