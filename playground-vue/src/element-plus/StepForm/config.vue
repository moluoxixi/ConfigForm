<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Steps 导航 / 步骤验证 / void 节点分步 — ConfigForm + ISchema 实现
    </p>
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
/**
 * 分步表单 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现分步表单。
 * 通过 type: 'void' + component: 'LayoutCard' 将字段分组，
 * 框架自动处理三种模式的渲染。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = { name: '', phone: '', email: '', company: '', position: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    step1: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '第 1 步：基本信息' },
      properties: {
        name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
        phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
        email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
      },
    },
    step2: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '第 2 步：工作信息' },
      properties: {
        company: { type: 'string', title: '公司', required: true },
        position: { type: 'string', title: '职位', required: true },
      },
    },
  },
}
</script>
