<template>
  <div>
    <h2>数组字段</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      增删 / 排序 / min-max 数量限制 — ConfigForm + ISchema 实现
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
 * 数组字段 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现数组字段的增删。
 * Schema 中通过 type: 'array' + items 定义数组结构，
 * minItems/maxItems 控制数量限制，itemTemplate 定义新增模板。
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

const initialValues = {
  groupName: '默认分组',
  contacts: [{ name: '', phone: '', email: '' }],
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    groupName: {
      type: 'string',
      title: '分组名称',
      required: true,
      componentProps: { placeholder: '请输入分组名称', style: 'width: 300px' },
    },
    contacts: {
      type: 'array',
      title: '联系人列表',
      minItems: 1,
      maxItems: 8,
      itemTemplate: { name: '', phone: '', email: '' },
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '姓名', componentProps: { placeholder: '姓名' } },
          phone: { type: 'string', title: '电话', componentProps: { placeholder: '电话' } },
          email: { type: 'string', title: '邮箱', componentProps: { placeholder: '邮箱' } },
        },
      },
    },
  },
}
</script>
