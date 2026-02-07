<template>
  <div>
    <h2>??????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ??????decorator ?????? FormItem???????????????????
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
 * ?? 52????????Ant Design Vue?? *
 * ????????decorator ???? * - CardDecorator????????
 * - InlineDecorator???????? * - ????FormItem ????
 */
import { defineComponent, h, ref } from 'vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerWrapper } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** ?????????????? */
const CardDecorator = defineComponent({
  name: 'CardDecorator',
  props: { label: String, required: Boolean, errors: { type: Array, default: () => [] }, description: String },
  setup(props, { slots }) {
    return () => h('div', {
      style: 'border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa',
    }, [
      h('div', { style: 'display: flex; align-items: center; margin-bottom: 8px;' }, [
        h('span', { style: 'font-weight: 600; font-size: 14px;' }, [
          props.label,
          props.required ? h('span', { style: 'color: #ff4d4f; margin-left: 4px;' }, '*') : null,
        ]),
      ]),
      slots.default?.(),
      props.description ? h('div', { style: 'color: #999; font-size: 12px; margin-top: 4px;' }, props.description) : null,
      (props.errors as Array<{ message: string }>).length > 0
        ? h('div', { style: 'color: #ff4d4f; font-size: 12px; margin-top: 4px;' }, (props.errors as Array<{ message: string }>)[0].message)
        : null,
    ])
  },
})

/** ????????????*/
const InlineDecorator = defineComponent({
  name: 'InlineDecorator',
  props: { label: String, required: Boolean, errors: { type: Array, default: () => [] } },
  setup(props, { slots }) {
    return () => h('div', {
      style: 'display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dashed #e8e8e8;',
    }, [
      h('span', { style: 'min-width: 80px; font-size: 13px; color: #555;' }, [
        props.label,
        props.required ? h('span', { style: 'color: #ff4d4f;' }, ' *') : null,
      ]),
      h('div', { style: 'flex: 1;' }, slots.default?.()),
      (props.errors as Array<{ message: string }>).length > 0
        ? h('span', { style: 'color: #ff4d4f; font-size: 12px; white-space: nowrap;' }, (props.errors as Array<{ message: string }>)[0].message)
        : null,
    ])
  },
})

/* ???????? */
registerWrapper('CardDecorator', CardDecorator)
registerWrapper('InlineDecorator', InlineDecorator)

const initialValues = {
  projectName: '', projectCode: '', description: '',
  contactName: '', contactPhone: '', contactEmail: '',
  budget: 0, startDate: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'top', actions: { submit: '??', reset: '??' } },
  properties: {
    projectName: {
      type: 'string', title: '????', required: true,
      decorator: 'CardDecorator',
      decoratorProps: {},
      description: '??????????',
    },
    projectCode: {
      type: 'string', title: '????', required: true,
      decorator: 'CardDecorator',
      rules: [{ pattern: '^[A-Z]{2}-\\d{4}$', message: '???XX-0000' }],
    },
    description: {
      type: 'string', title: '????', component: 'Textarea',
      decorator: 'CardDecorator',
      description: '???500 ??,
    },
    contactName: {
      type: 'string', title: '????, required: true,
      decorator: 'InlineDecorator',
    },
    contactPhone: {
      type: 'string', title: '??',
      decorator: 'InlineDecorator',
      rules: [{ format: 'phone', message: '????????' }],
    },
    contactEmail: {
      type: 'string', title: '??',
      decorator: 'InlineDecorator',
      rules: [{ format: 'email', message: '???????? }],
    },
    budget: {
      type: 'number', title: '??????',
      /* ???? FormItem ????*/
      componentProps: { min: 0 },
    },
    startDate: {
      type: 'date', title: '?????,
      /* ???? FormItem ????*/
    },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
