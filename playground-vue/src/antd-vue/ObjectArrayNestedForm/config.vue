<template>
  <div>
    <h2>对象数组嵌套</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      联系人数组 → 每人含嵌套电话数组 — ConfigForm + ISchema 实现
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
 * 对象数组嵌套 — Config 模式（Ant Design Vue）
 *
 * 使用 ConfigForm + ISchema 实现嵌套数组结构。
 * 通过 type: 'array' + items 定义多层嵌套。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  teamName: '开发团队',
  contacts: [
    { name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] },
    { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] },
  ],
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    teamName: {
      type: 'string',
      title: '团队名称',
      required: true,
      componentProps: { placeholder: '请输入团队名称', style: 'width: 300px' },
    },
    contacts: {
      type: 'array',
      title: '团队成员',
      minItems: 1,
      maxItems: 10,
      itemTemplate: { name: '', role: '', phones: [{ number: '', label: '手机' }] },
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '姓名', required: true, componentProps: { placeholder: '姓名' } },
          role: { type: 'string', title: '角色', componentProps: { placeholder: '角色' } },
          phones: {
            type: 'array',
            title: '电话列表',
            minItems: 1,
            maxItems: 5,
            itemTemplate: { number: '', label: '手机' },
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', title: '标签', componentProps: { placeholder: '标签', style: 'width: 80px' } },
                number: { type: 'string', title: '号码', componentProps: { placeholder: '号码' } },
              },
            },
          },
        },
      },
    },
  },
}
</script>
