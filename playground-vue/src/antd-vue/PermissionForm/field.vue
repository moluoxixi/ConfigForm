<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      基于角色的字段可见性 + 读写权限矩阵
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <!-- 角色选择器（附加内容） -->
          <ASpace style="margin-bottom: 16px">
            <span style="font-weight: 600">当前角色：</span>
            <ASegmented v-model:value="role" :options="ROLE_OPTIONS" />
          </ASpace>
          <!-- 权限矩阵展示（附加内容） -->
          <ACard size="small" style="margin-bottom: 16px">
            <span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px">
              <ATag v-for="d in FIELD_DEFS" :key="d.name" :color="getPermColor(d.name)">
                {{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}
              </ATag>
            </div>
          </ACard>
          <!-- 表单字段：可见性和读写权限由 watch 动态控制 -->
          <FormField v-for="d in FIELD_DEFS" :key="d.name" :name="d.name" :field-props="getFieldProps(d)" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 字段级权限控制表单 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps。基于角色的可见性和读写权限通过 watch 动态设置
 * 字段实例的 visible / pattern 属性，框架自动将权限状态传播到组件。
 */
import { Card as ACard, Segmented as ASegmented, Space as ASpace, Tag as ATag } from 'ant-design-vue'
import { ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 角色类型 */
type Role = 'admin' | 'manager' | 'staff' | 'guest'

/** 当前角色 */
const role = ref<Role>('admin')

/** 角色选项 */
const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '经理', value: 'manager' },
  { label: '员工', value: 'staff' },
  { label: '访客', value: 'guest' },
]

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名' },
  { name: 'email', label: '邮箱' },
  { name: 'salary', label: '薪资' },
  { name: 'department', label: '部门' },
  { name: 'level', label: '职级' },
  { name: 'remark', label: '备注' },
]

/** 权限矩阵：字段名 → 角色 → 权限 */
const PERM_MATRIX: Record<string, Record<Role, string>> = {
  name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' },
  email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' },
  salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' },
  level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' },
}

/** 获取权限颜色标签 */
function getPermColor(name: string): string {
  const perm = PERM_MATRIX[name]?.[role.value] ?? 'hidden'
  if (perm === 'editable') return 'green'
  if (perm === 'readOnly') return 'orange'
  return 'red'
}

/** 根据字段定义生成 fieldProps */
function getFieldProps(d: FieldDef): Record<string, unknown> {
  if (d.name === 'salary') {
    return { label: d.label, component: 'InputNumber', componentProps: { style: 'width: 100%' } }
  }
  if (d.name === 'remark') {
    return { label: d.label, component: 'Textarea' }
  }
  return { label: d.label, component: 'Input' }
}

const form = useCreateForm({
  initialValues: {
    name: '张三',
    email: 'zhangsan@company.com',
    salary: 25000,
    department: '技术部',
    level: 'P7',
    remark: '',
  },
})

/** 根据当前角色和表单模式应用字段权限 */
function applyPermissions(): void {
  FIELD_DEFS.forEach((d) => {
    const f = form.getField(d.name)
    if (!f) return
    const perm = PERM_MATRIX[d.name]?.[role.value] ?? 'hidden'
    f.visible = perm !== 'hidden'
    if (form.pattern === 'editable') {
      f.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern
    }
    else {
      f.pattern = form.pattern
    }
  })
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 角色或表单模式变化时重新应用权限 */
watch([role, () => form.pattern], applyPermissions, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
