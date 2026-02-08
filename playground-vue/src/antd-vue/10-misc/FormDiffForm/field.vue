<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      变更高亮 / 原始值 vs 当前值 / 变更摘要
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <!-- 变更摘要卡片（附加内容） -->
          <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
              <span style="font-weight: 600">变更摘要：</span>
              <span v-if="changedFields.length === 0" style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; color: #52c41a">
                无变更
              </span>
              <template v-else>
                <span style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 4px; color: #fa8c16">
                  {{ changedFields.length }} 个已修改
                </span>
                <span v-for="d in changedFields" :key="d.name" style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 4px; color: #f5222d">
                  {{ d.label }}
                </span>
              </template>
            </div>
          </div>
          <!-- 表单字段：外层 div 添加 diff 高亮样式 -->
          <div
            v-for="d in FIELD_DEFS" :key="d.name"
            :style="{
              background: isChanged(d.name) ? '#fffbe6' : undefined,
              padding: isChanged(d.name) ? '4px 8px' : undefined,
              borderRadius: '4px',
              marginBottom: isChanged(d.name) ? '4px' : undefined,
            }"
          >
            <FormField :name="d.name" :field-props="getFieldProps(d)" />
            <div v-if="isChanged(d.name)" style="color: #faad14; font-size: 12px; margin-top: -8px; margin-bottom: 8px; padding-left: 8px">
              原始值: {{ String(ORIGINAL[d.name] ?? '—') }}
            </div>
          </div>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 表单比对 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps，diff 高亮通过外层 div 样式实现。
 * 变更摘要卡片作为附加内容，实时展示已修改字段。
 */
import { computed, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea'
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'text' },
  { name: 'phone', label: '电话', type: 'text' },
  { name: 'salary', label: '薪资', type: 'number' },
  { name: 'department', label: '部门', type: 'text' },
  { name: 'bio', label: '简介', type: 'textarea' },
]

/** 原始值（用于 diff 比较） */
const ORIGINAL: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  salary: 25000,
  department: '技术部',
  bio: '5 年前端经验',
}

/** 当前值的响应式副本（用于 diff 比较） */
const currentValues = ref<Record<string, unknown>>({ ...ORIGINAL })

const form = useCreateForm({ initialValues: { ...ORIGINAL } })

/** 监听表单值变化，同步到 currentValues */
form.onValuesChange((v: Record<string, unknown>) => {
  currentValues.value = { ...v }
})

/** 判断字段是否已变更 */
function isChanged(name: string): boolean {
  return String(ORIGINAL[name] ?? '') !== String(currentValues.value[name] ?? '')
}

/** 已变更的字段列表 */
const changedFields = computed(() => FIELD_DEFS.filter(d => isChanged(d.name)))

/** 根据字段定义生成 fieldProps */
function getFieldProps(d: FieldDef): Record<string, unknown> {
  const base: Record<string, unknown> = { label: d.label }
  if (d.type === 'number') {
    base.component = 'InputNumber'
    base.componentProps = { style: 'width: 100%' }
  }
  else if (d.type === 'textarea') {
    base.component = 'Textarea'
    base.componentProps = { rows: 2 }
  }
  else {
    base.component = 'Input'
  }
  return base
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
