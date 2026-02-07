<template>
  <div>
    <h2>????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
    </p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
/**
 * ?? 1??????Ant Design Vue?
 *
 * ?????????? + ??????
 */
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = {
  username: '', password: '', email: '', phone: '', age: 18,
  gender: undefined, marital: 'single', hobbies: [], notification: true, birthday: '', bio: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '??', reset: '??' } },
  properties: {
    username: { type: 'string', title: '???', required: true, rules: [{ minLength: 3, maxLength: 20, message: '3-20 ???' }] },
    password: { type: 'string', title: '??', required: true, component: 'Password', rules: [{ minLength: 8, message: '?? 8 ??' }] },
    email: { type: 'string', title: '??', required: true, rules: [{ format: 'email', message: '????' }] },
    phone: { type: 'string', title: '???', rules: [{ format: 'phone', message: '?????' }] },
    age: { type: 'number', title: '??', required: true, default: 18, componentProps: { min: 0, max: 150 } },
    gender: { type: 'string', title: '??', enum: [{ label: '?', value: 'male' }, { label: '?', value: 'female' }] },
    marital: { type: 'string', title: '????', component: 'RadioGroup', default: 'single', enum: [{ label: '??', value: 'single' }, { label: '??', value: 'married' }] },
    hobbies: { type: 'array', title: '??', component: 'CheckboxGroup', default: [], enum: [{ label: '??', value: 'reading' }, { label: '??', value: 'sports' }, { label: '??', value: 'coding' }] },
    notification: { type: 'boolean', title: '????', default: true },
    birthday: { type: 'date', title: '??' },
    bio: { type: 'string', title: '????', component: 'Textarea', rules: [{ maxLength: 200, message: '??? 200 ?' }] },
  },
}
</script>
