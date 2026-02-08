<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">变更高亮 / 原始值 vs 当前值 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 表单比对 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现表单比对。
 * 实际比对高亮需借助 field 模式的 onValuesChange；此处展示 schema 驱动的基础表单。
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { name: '张三', email: 'zhangsan@company.com', phone: '13800138000', salary: 25000, department: '技术部', bio: '5 年前端经验' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    name: { type: 'string', title: '姓名' },
    email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', title: '电话', rules: [{ format: 'phone', message: '无效手机号' }] },
    salary: { type: 'number', title: '薪资', componentProps: { style: 'width: 100%' } },
    department: { type: 'string', title: '部门' },
    bio: { type: 'string', title: '简介', component: 'Textarea', componentProps: { rows: 2 } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
