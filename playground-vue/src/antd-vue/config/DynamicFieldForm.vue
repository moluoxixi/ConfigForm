<template>
  <div>
    <h2>动态增删字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">运行时添加/移除字段</p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
        <ACard v-if="mode === 'editable'" size="small" title="添加新字段" style="margin-bottom: 16px">
          <ASpace><AInput v-model:value="newLabel" placeholder="字段标签" style="width: 200px" /><ASelect v-model:value="newType" :options="[{label:'文本',value:'text'},{label:'数字',value:'number'},{label:'选择',value:'select'}]" style="width: 120px" /><AButton type="primary" :disabled="!newLabel.trim()" @click="addField">添加</AButton></ASpace>
          <div style="margin-top: 8px; color: #999; font-size: 12px">已添加 {{ dynamicFields.length }} 个动态字段</div>
        </ACard>
        <FormField v-slot="{ field }" name="title"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" /></AFormItem></FormField>
        <FormField v-for="df in dynamicFields" :key="df.id" v-slot="{ field }" :name="df.name">
          <AFormItem :label="field.label">
            <ASpace style="width: 100%">
              <ASelect v-if="df.fieldType === 'select'" :value="(field.value as string)" @change="(v: string) => field.setValue(v)" :options="[{label:'A',value:'a'},{label:'B',value:'b'},{label:'C',value:'c'}]" placeholder="请选择" style="width: 200px" :disabled="mode === 'disabled'" />
              <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 200px" />
              <AButton v-if="mode === 'editable'" danger @click="removeField(df.id)">删除</AButton>
            </ASpace>
          </AFormItem>
        </FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, Select as ASelect, Card as ACard, FormItem as AFormItem } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const newLabel = ref('')
const newType = ref('text')
let counter = 0

interface DynField { id: string; name: string; label: string; fieldType: string }
const dynamicFields = ref<DynField[]>([])

const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => { form.createField({ name: 'title', label: '表单标题', required: true }) })

function addField(): void { if (!newLabel.value.trim()) return; counter++; const id = `dyn_${counter}`; form.createField({ name: id, label: newLabel.value.trim() }); dynamicFields.value.push({ id, name: id, label: newLabel.value.trim(), fieldType: newType.value }); newLabel.value = '' }
function removeField(id: string): void { form.removeField(id); dynamicFields.value = dynamicFields.value.filter(f => f.id !== id) }
</script>
