<template>
  <div>
    <h2>数组字段</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      增删 / 排序 / 复制 / min-max 数量限制
    </p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="groupName">
          <el-form-item :label="field.label" :required="field.required">
            <el-input :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 300px" @update:model-value="field.setValue($event)" />
          </el-form-item>
        </FormField>
        <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 8, itemTemplate: () => ({ name: '', phone: '', email: '' }) }">
          <div style="margin-bottom: 16px">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span style="font-weight: 600">联系人列表 ({{ ((arrayField.value as unknown[]) ?? []).length }}/8)</span>
              <el-button v-if="mode === 'editable'" type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', phone: '', email: '' })">
                添加
              </el-button>
            </div>
            <div v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" :style="{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: '8px', padding: '8px 12px', background: idx % 2 === 0 ? '#fafafa' : '#fff', borderRadius: '4px', alignItems: 'center' }">
              <span style="color: #999">#{{ idx + 1 }}</span>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.name`">
                <el-input :model-value="(field.value as string) ?? ''" placeholder="姓名" size="small" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
              </FormField>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.phone`">
                <el-input :model-value="(field.value as string) ?? ''" placeholder="电话" size="small" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
              </FormField>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.email`">
                <el-input :model-value="(field.value as string) ?? ''" placeholder="邮箱" size="small" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
              </FormField>
              <el-space v-if="mode === 'editable'" :size="4">
                <el-button size="small" :disabled="idx === 0" @click="arrayField.moveUp(idx)">
                  ↑
                </el-button>
                <el-button size="small" :disabled="idx === ((arrayField.value as unknown[]) ?? []).length - 1" @click="arrayField.moveDown(idx)">
                  ↓
                </el-button>
                <el-button size="small" type="danger" :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">
                  删
                </el-button>
              </el-space>
            </div>
          </div>
        </FormArrayField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">
          提交
        </el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { groupName: '默认分组', contacts: [{ name: '', phone: '', email: '' }] } })
onMounted(() => {
  form.createField({ name: 'groupName', label: '分组名称', required: true })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    result.value = `验证失败: ${res.errors.map(e => e.message).join(', ')}`
  }
  else {
    result.value = JSON.stringify(res.values, null, 2)
  }
}
</script>
