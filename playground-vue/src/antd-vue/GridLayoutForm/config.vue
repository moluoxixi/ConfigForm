<template>
  <div>
    <h2>Grid ????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ?? span ??????????? 24 ????????????
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * ?? 49?Grid ?????Ant Design Vue?? *
 * ?? schema.span ????????????24 ????? * decoratorProps.grid ??????????? span ?????? */
import { ref } from 'vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'top',
    labelWidth: 'auto',
    actions: { submit: '??', reset: '??' },
    grid: true,
    gridColumns: 24,
    gridGap: '16px',
  },
  properties: {
    firstName: {
      type: 'string',
      title: '??,
      required: true,
      span: 12,
      componentProps: { placeholder: '?????? },
    },
    lastName: {
      type: 'string',
      title: '??,
      required: true,
      span: 12,
      componentProps: { placeholder: '?????? },
    },
    email: {
      type: 'string',
      title: '??',
      span: 16,
      rules: [{ format: 'email', message: '???????? }],
      componentProps: { placeholder: 'user@example.com' },
    },
    age: {
      type: 'number',
      title: '??',
      span: 8,
      componentProps: { min: 0, max: 150 },
    },
    address: {
      type: 'string',
      title: '????',
      span: 24,
      component: 'Textarea',
      componentProps: { placeholder: '???????', rows: 2 },
    },
    province: {
      type: 'string',
      title: '??',
      span: 8,
      enum: [
        { label: '??', value: 'beijing' },
        { label: '??', value: 'shanghai' },
        { label: '??', value: 'guangdong' },
      ],
    },
    city: {
      type: 'string',
      title: '??',
      span: 8,
      componentProps: { placeholder: '?????? },
    },
    zipCode: {
      type: 'string',
      title: '??',
      span: 8,
      componentProps: { placeholder: '100000' },
    },
    phone: {
      type: 'string',
      title: '????,
      span: 12,
      rules: [{ format: 'phone', message: '????????' }],
    },
    notification: {
      type: 'boolean',
      title: '????',
      span: 12,
    },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
