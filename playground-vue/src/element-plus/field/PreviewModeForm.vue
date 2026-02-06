<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Element Plus Field 组件 - 模式切换
    </h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      4 种模式切换（editable / readOnly / disabled / preview）/ Card 分组 / ARIA 标签
    </p>

    <!-- 模式切换按钮组 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 12px;" role="radiogroup" aria-label="表单模式">
      <span style="font-weight: 600; color: #303133;">当前模式：</span>
      <ElButtonGroup>
        <ElButton
          v-for="p in patterns" :key="p.key"
          :type="currentPattern === p.key ? p.type : 'default'"
          role="radio"
          :aria-checked="currentPattern === p.key" @click="switchPattern(p.key)"
        >
          {{ p.label }}
        </ElButton>
      </ElButtonGroup>
      <ElTag :type="currentPattern === 'editable' ? 'primary' : currentPattern === 'readOnly' ? 'success' : currentPattern === 'disabled' ? 'warning' : 'danger'">
        {{ currentPattern }}
      </ElTag>
    </div>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- Card 分组 -->
        <ElCard
          v-for="group in groups" :key="group.key"
          shadow="never" style="margin-bottom: 20px;"
          role="group" :aria-label="group.title"
        >
          <template #header>
            <span style="font-weight: 600;">{{ group.title }}</span>
          </template>

          <!-- preview 模式用 Descriptions 展示 -->
          <template v-if="currentPattern === 'preview'">
            <ElDescriptions :column="group.key === 'extra' ? 1 : 2" border>
              <ElDescriptionsItem
                v-for="fieldName in group.fields" :key="fieldName"
                :label="fieldDefs.find((d) => d.name === fieldName)?.label ?? fieldName"
              >
                {{ formatDisplayValue({ value: form.values[fieldName], name: fieldName }) }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </template>

          <!-- 其他模式用表单组件 -->
          <template v-else>
            <div :style="{ display: 'grid', gridTemplateColumns: group.key === 'extra' ? '1fr' : '1fr 1fr', gap: '0 24px' }">
              <FormField v-for="fieldName in group.fields" :key="fieldName" v-slot="{ field }" :name="fieldName">
                <ElFormItem
                  :label="field.label"
                  :required="field.required && currentPattern === 'editable'"
                  :error="field.errors.length > 0 ? field.errors[0].message : ''"
                  :for="`field-${field.name}`"
                >
                  <!-- 下拉选择 -->
                  <ElSelect
                    v-if="field.dataSource.length > 0"
                    :id="`field-${field.name}`"
                    :model-value="(field.value as string)"
                    :disabled="currentPattern === 'disabled'"
                    style="width: 100%;"
                    @update:model-value="field.setValue($event)"
                  >
                    <ElOption v-for="item in field.dataSource" :key="String(item.value)" :label="item.label" :value="item.value" />
                  </ElSelect>
                  <!-- 文本域 -->
                  <ElInput
                    v-else-if="fieldName === 'bio'"
                    :id="`field-${field.name}`"
                    type="textarea" :rows="3"
                    :model-value="(field.value as string)"
                    :disabled="currentPattern === 'disabled'"
                    :readonly="currentPattern === 'readOnly'"
                    :aria-required="field.required"
                    @update:model-value="field.setValue($event)"
                  />
                  <!-- 数字输入 -->
                  <ElInputNumber
                    v-else-if="fieldName === 'salary'"
                    :id="`field-${field.name}`"
                    :model-value="(field.value as number)"
                    :disabled="currentPattern === 'disabled'"
                    :min="0"
                    controls-position="right" style="width: 100%;" @update:model-value="field.setValue($event)"
                  />
                  <!-- 普通输入 -->
                  <ElInput
                    v-else
                    :id="`field-${field.name}`"
                    :model-value="(field.value as string)"
                    :disabled="currentPattern === 'disabled'"
                    :readonly="currentPattern === 'readOnly'"
                    :aria-required="field.required"
                    :aria-invalid="field.errors.length > 0"
                    @update:model-value="field.setValue($event)"
                    @blur="field.blur(); field.validate('blur')"
                  />
                </ElFormItem>
              </FormField>
            </div>
          </template>
        </ElCard>

        <ElButton v-if="currentPattern === 'editable'" type="primary" native-type="submit">
          提交
        </ElButton>
      </form>
    </FormProvider>

    <ElCard v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import {
  ElButton,
  ElButtonGroup,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElTag,
} from 'element-plus'
/**
 * Element Plus Field 组件模式 - 模式切换
 *
 * 覆盖场景：
 * - 4 种模式切换（editable / readOnly / disabled / preview）
 * - Card 分组布局
 * - ARIA 可访问性
 * - 格式化预览显示
 */
import { ref } from 'vue'
import 'element-plus/dist/index.css'

setupElementPlus()

const currentPattern = ref<FieldPattern>('editable')

const form = useCreateForm({
  initialValues: {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    department: '技术部',
    role: '前端工程师',
    bio: '5 年前端开发经验，擅长 Vue/React。',
    joinDate: '2020-03-15',
    salary: 25000,
  },
})

/** 字段定义 */
const fieldDefs = [
  { name: 'name', label: '姓名', required: true, group: 'basic' },
  { name: 'email', label: '邮箱', required: true, rules: [{ format: 'email' as const }], group: 'basic' },
  { name: 'phone', label: '电话', group: 'basic' },
  {
    name: 'department',
    label: '部门',
    group: 'work',
    dataSource: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '设计部', value: '设计部' },
      { label: '市场部', value: '市场部' },
    ],
  },
  { name: 'role', label: '职位', group: 'work' },
  { name: 'joinDate', label: '入职日期', group: 'work' },
  { name: 'salary', label: '月薪（元）', group: 'work' },
  { name: 'bio', label: '个人简介', group: 'extra' },
]
for (const def of fieldDefs) {
  form.createField(def)
}

/** 分组定义 */
const groups = [
  { key: 'basic', title: '基本信息', fields: ['name', 'email', 'phone'] },
  { key: 'work', title: '工作信息', fields: ['department', 'role', 'joinDate', 'salary'] },
  { key: 'extra', title: '补充信息', fields: ['bio'] },
]

/** 模式配置 */
const patterns: { key: FieldPattern, label: string, type: 'primary' | 'success' | 'warning' | 'danger' }[] = [
  { key: 'editable', label: '编辑', type: 'primary' },
  { key: 'readOnly', label: '只读', type: 'success' },
  { key: 'disabled', label: '禁用', type: 'warning' },
  { key: 'preview', label: '预览', type: 'danger' },
]

/** 切换模式 */
function switchPattern(pattern: FieldPattern): void {
  currentPattern.value = pattern
  for (const def of fieldDefs) {
    const field = form.getField(def.name)
    if (field)
      field.pattern = pattern
  }
}

const submitResult = ref('')
async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.errors.length > 0) {
    submitResult.value = `验证失败: ${result.errors.map(e => e.message).join(', ')}`
    ElMessage.error('验证失败')
  }
  else {
    submitResult.value = JSON.stringify(result.values, null, 2)
    ElMessage.success('提交成功')
  }
}

/** 格式化预览值 */
function formatDisplayValue(field: { value: unknown, name: string }): string {
  const val = field.value
  if (val === null || val === undefined || val === '')
    return '—'
  if (field.name === 'salary')
    return `¥${Number(val).toLocaleString()}`
  return String(val)
}
</script>
