<template>
  <div>
    <h2>????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      FormField + fieldProps ????? � component / wrapper ???? � ??????
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <FormField name="username" :field-props="{ label: '???', required: true, component: 'Input', rules: [{ minLength: 3, maxLength: 20, message: '3-20 ???' }], componentProps: { placeholder: '??????' } }" />
          <FormField name="password" :field-props="{ label: '??', required: true, component: 'Password', rules: [{ minLength: 8, message: '?? 8 ???' }], componentProps: { placeholder: '?????' } }" />
          <FormField name="email" :field-props="{ label: '??', required: true, component: 'Input', rules: [{ format: 'email', message: '???????' }], componentProps: { placeholder: '?????' } }" />
          <FormField name="phone" :field-props="{ label: '???', component: 'Input', rules: [{ format: 'phone', message: '????????' }], componentProps: { placeholder: '??????' } }" />
          <FormField name="age" :field-props="{ label: '??', required: true, component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' } }" />
          <FormField name="gender" :field-props="{ label: '??', component: 'Select', dataSource: GENDER_OPTIONS, componentProps: { placeholder: '?????', allowClear: true } }" />
          <FormField name="marital" :field-props="{ label: '????', component: 'RadioGroup', dataSource: MARITAL_OPTIONS }" />
          <FormField name="hobbies" :field-props="{ label: '??', component: 'CheckboxGroup', dataSource: HOBBY_OPTIONS }" />
          <FormField name="notification" :field-props="{ label: '????', component: 'Switch' }" />
          <FormField name="birthday" :field-props="{ label: '??', component: 'DatePicker', componentProps: { style: 'width: 100%' } }" />
          <FormField name="bio" :field-props="{ label: '????', component: 'Textarea', rules: [{ maxLength: 200, message: '?? 200 ?' }], componentProps: { placeholder: '???????', rows: 3 } }" />
          <!-- ??????????? -->
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
 * ?? 1????? - Field ???Ant Design Vue?
 *
 * ?? FormProvider + FormField ???????? Formily ? Field ???
 * ?? FormField ?? fieldProps ???????ReactiveField ???????????
 */
import { ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** ???? */
const GENDER_OPTIONS = [{ label: '?', value: 'male' }, { label: '?', value: 'female' }]
const MARITAL_OPTIONS = [{ label: '??', value: 'single' }, { label: '??', value: 'married' }]
const HOBBY_OPTIONS = [{ label: '??', value: 'reading' }, { label: '??', value: 'sports' }, { label: '??', value: 'coding' }]

const form = useCreateForm({
  initialValues: {
    username: '',
    password: '',
    email: '',
    phone: '',
    age: 18,
    gender: undefined,
    marital: 'single',
    hobbies: [] as string[],
    notification: true,
    birthday: '',
    bio: '',
  },
})

/** ?? StatusTabs ? mode ? form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** ???? */
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
