<template>
  <div>
    <h2>模板复用</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Schema 片段复用 + 继承覆盖 = 不同业务表单 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="`${templateKey}-${mode}`"
        :schema="withMode(computedSchema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
        @values-change="handleValuesChange"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 模板复用 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + mergeSchema 实现模板复用：
 * - 基础 Schema 片段（个人信息 + 地址 + 备注）可复用
 * - 不同业务场景通过覆盖 Schema 片段实现差异化
 * - 通过 schema 中的 RadioGroup 切换模板
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

type TKey = 'employee' | 'customer' | 'supplier'
const templateKey = ref<TKey>('employee')

/** 可复用的 Schema 片段 */
const PERSON: Record<string, ISchema> = {
  name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
  phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
  email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
}

const ADDRESS: Record<string, ISchema> = {
  province: { type: 'string', title: '省份', component: 'Select', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] },
  city: { type: 'string', title: '城市' },
  address: { type: 'string', title: '详细地址', component: 'Textarea' },
}

const REMARK: Record<string, ISchema> = {
  remark: { type: 'string', title: '备注', component: 'Textarea', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
}

/** 各模板的覆盖 */
const TEMPLATES: Record<TKey, { overrides: Record<string, ISchema> }> = {
  employee: {
    overrides: {
      name: { type: 'string', title: '员工姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      department: { type: 'string', title: '部门', required: true, component: 'Select', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] },
      position: { type: 'string', title: '职位', required: true },
    },
  },
  customer: {
    overrides: {
      name: { type: 'string', title: '客户姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      company: { type: 'string', title: '所属公司' },
      level: { type: 'string', title: '等级', component: 'Select', enum: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }] },
    },
  },
  supplier: {
    overrides: {
      name: { type: 'string', title: '联系人', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
      companyName: { type: 'string', title: '公司名称', required: true },
      creditCode: { type: 'string', title: '信用代码', required: true, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位' }] },
    },
  },
}

/** 监听 _template 字段变化 */
function handleValuesChange(values: Record<string, unknown>): void {
  const t = values._template as TKey | undefined
  if (t && t !== templateKey.value && TEMPLATES[t]) {
    templateKey.value = t
  }
}

const computedSchema = computed<ISchema>(() => {
  const properties: Record<string, ISchema> = {
    /* 模板选择器 */
    _template: {
      type: 'string', title: '业务模板', default: templateKey.value, component: 'RadioGroup', order: -1,
      enum: [{ label: '员工入职', value: 'employee' }, { label: '客户登记', value: 'customer' }, { label: '供应商注册', value: 'supplier' }],
    },
    ...PERSON,
    ...ADDRESS,
    ...REMARK,
  }

  /* 应用模板覆盖 */
  const t = TEMPLATES[templateKey.value]
  for (const [k, v] of Object.entries(t.overrides)) {
    properties[k] = properties[k] ? { ...properties[k], ...v } : v
  }

  return {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
    properties,
  }
})
</script>
