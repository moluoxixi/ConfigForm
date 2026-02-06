<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 模式切换
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      4 种模式切换（editable / readOnly / disabled / preview）/ a-card 分组 / ARIA 标签
    </p>

    <!-- 模式切换按钮组 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 12px;" role="radiogroup" aria-label="表单模式">
      <span style="font-weight: 600; color: rgba(0,0,0,0.85);">当前模式：</span>
      <ARadioGroup :value="currentPattern" button-style="solid" @update:value="switchPattern($event as FieldPattern)">
        <ARadioButton v-for="p in patterns" :key="p.key" :value="p.key">
          {{ p.label }}
        </ARadioButton>
      </ARadioGroup>
      <ATag :color="patterns.find((p) => p.key === currentPattern)?.color">
        {{ currentPattern }}
      </ATag>
    </div>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- Card 分组 -->
        <ACard
          v-for="group in groups" :key="group.key"
          style="margin-bottom: 20px;"
          role="group" :aria-label="group.title"
        >
          <template #title>
            {{ group.title }}
          </template>

          <!-- preview 模式用 Descriptions 展示 -->
          <template v-if="currentPattern === 'preview'">
            <ADescriptions :column="group.key === 'extra' ? 1 : 2" bordered>
              <ADescriptionsItem
                v-for="fieldName in group.fields" :key="fieldName"
                :label="fieldDefs.find((d) => d.name === fieldName)?.label ?? fieldName"
              >
                {{ formatDisplayValue({ value: form.values[fieldName], name: fieldName }) }}
              </ADescriptionsItem>
            </ADescriptions>
          </template>

          <!-- 其他模式用表单组件 -->
          <template v-else>
            <div :style="{ display: 'grid', gridTemplateColumns: group.key === 'extra' ? '1fr' : '1fr 1fr', gap: '0 24px' }">
              <FormField v-for="fieldName in group.fields" :key="fieldName" v-slot="{ field }" :name="fieldName">
                <AFormItem
                  :label="field.label"
                  :required="field.required && currentPattern === 'editable'"
                  :validate-status="field.errors.length > 0 ? 'error' : ''"
                  :help="field.errors[0]?.message"
                  :for="`field-${field.name}`"
                >
                  <!-- 下拉选择 -->
                  <ASelect
                    v-if="field.dataSource.length > 0"
                    :id="`field-${field.name}`"
                    :value="(field.value as string) || undefined"
                    :disabled="currentPattern === 'disabled'"
                    style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                    @update:value="field.setValue($event)"
                  />
                  <!-- 文本域 -->
                  <ATextarea
                    v-else-if="fieldName === 'bio'"
                    :id="`field-${field.name}`"
                    :value="(field.value as string)" :disabled="currentPattern === 'disabled'"
                    :rows="3" :aria-required="field.required"
                    @update:value="field.setValue($event)"
                  />
                  <!-- 数字输入 -->
                  <AInputNumber
                    v-else-if="fieldName === 'salary'"
                    :id="`field-${field.name}`"
                    :value="(field.value as number)" :disabled="currentPattern === 'disabled'"
                    :min="0" style="width: 100%;" @update:value="field.setValue($event)"
                  />
                  <!-- 普通输入 -->
                  <AInput
                    v-else
                    :id="`field-${field.name}`"
                    :value="(field.value as string)" :disabled="currentPattern === 'disabled'"
                    :aria-required="field.required"
                    :aria-invalid="field.errors.length > 0"
                    @update:value="field.setValue($event)" @blur="field.blur(); field.validate('blur')"
                  />
                </AFormItem>
              </FormField>
            </div>
          </template>
        </ACard>

        <AButton v-if="currentPattern === 'editable'" type="primary" html-type="submit">
          提交
        </AButton>
      </form>
    </FormProvider>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import {
  Button as AButton,
  Card as ACard,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  RadioButton as ARadioButton,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Tag as ATag,
  Textarea as ATextarea,
  message,
} from 'ant-design-vue'
/**
 * Ant Design Vue Field 组件模式 - 模式切换
 *
 * 覆盖场景：
 * - 4 种模式切换（editable / readOnly / disabled / preview）
 * - a-card 分组布局
 * - ARIA 可访问性标签
 * - 格式化预览显示（a-descriptions）
 */
import { ref } from 'vue'

setupAntdVue()

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
const patterns: { key: FieldPattern, label: string, color: string }[] = [
  { key: 'editable', label: '编辑', color: '#1677ff' },
  { key: 'readOnly', label: '只读', color: '#52c41a' },
  { key: 'disabled', label: '禁用', color: '#faad14' },
  { key: 'preview', label: '预览', color: '#ff4d4f' },
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
    message.error('验证失败')
  }
  else {
    submitResult.value = JSON.stringify(result.values, null, 2)
    message.success('提交成功')
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
