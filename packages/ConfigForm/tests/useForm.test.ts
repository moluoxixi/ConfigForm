import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'
import { defineField } from '../src/models/FieldDef'

describe('useForm', () => {
  it('initializes from model values and reacts to external replacements', async () => {
    const fields = ref([
      defineField({ field: 'name', component: 'input', defaultValue: 'default name' }),
      defineField({ field: 'age', component: 'input', defaultValue: 18 }),
    ])
    const model = ref<Record<string, unknown>>({ name: 'Ada' })

    const form = useForm({ fields, initialValues: model })

    expect(form.getValues()).toEqual({ name: 'Ada', age: 18 })

    model.value = { name: 'Grace', age: 37 }
    await nextTick()

    expect(form.getValues()).toEqual({ name: 'Grace', age: 37 })

    model.value = {}
    await nextTick()

    expect(form.getValues()).toEqual({ name: 'default name', age: 18 })
  })

  it('supports validators that can inspect all field values', async () => {
    const fields = ref([
      defineField({ field: 'password', component: 'input', defaultValue: 'secret' }),
      defineField({
        field: 'confirm',
        component: 'input',
        defaultValue: 'nope',
        validator: (value, values) => value === values.password ? undefined : '两次密码不一致',
      }),
    ])

    const form = useForm({ fields })

    await expect(form.validate()).resolves.toBe(false)
    expect(form.errors.value.confirm).toEqual(['两次密码不一致'])

    form.setValue('confirm', 'secret')

    await expect(form.validate()).resolves.toBe(true)
    expect(form.errors.value.confirm).toBeUndefined()
  })

  it('lets fields opt into submitting hidden or disabled values', async () => {
    const onSubmit = vi.fn()
    const fields = ref([
      defineField({ field: 'visible', component: 'input', defaultValue: 'ok' }),
      defineField({ field: 'hidden', component: 'input', defaultValue: 'skip', visible: () => false }),
      defineField({ field: 'disabled', component: 'input', defaultValue: 'skip', disabled: () => true }),
      defineField({
        field: 'hiddenKept',
        component: 'input',
        defaultValue: 'keep',
        visible: () => false,
        submitWhenHidden: true,
      }),
      defineField({
        field: 'disabledKept',
        component: 'input',
        defaultValue: 'keep',
        disabled: () => true,
        submitWhenDisabled: true,
      }),
    ])

    const form = useForm({ fields, onSubmit })

    await expect(form.submit()).resolves.toBe(true)
    expect(onSubmit).toHaveBeenCalledWith({
      visible: 'ok',
      hiddenKept: 'keep',
      disabledKept: 'keep',
    })
  })

  it('validates hidden or disabled fields when they opt into submit output', async () => {
    const fields = ref([
      defineField({
        field: 'hiddenSkipped',
        component: 'input',
        visible: () => false,
        validator: () => '不会出现',
      }),
      defineField({
        field: 'hiddenKept',
        component: 'input',
        visible: () => false,
        submitWhenHidden: true,
        validator: () => '隐藏字段需要校验',
      }),
      defineField({
        field: 'disabledKept',
        component: 'input',
        disabled: () => true,
        submitWhenDisabled: true,
        validator: () => '禁用字段需要校验',
      }),
    ])

    const form = useForm({ fields })

    await expect(form.submit()).resolves.toBe(false)
    expect(form.errors.value.hiddenSkipped).toBeUndefined()
    expect(form.errors.value.hiddenKept).toEqual(['隐藏字段需要校验'])
    expect(form.errors.value.disabledKept).toEqual(['禁用字段需要校验'])
  })

  it('validates single fields by trigger and clears errors on value changes', async () => {
    const fields = ref([
      defineField({
        field: 'name',
        component: 'input',
        defaultValue: '',
        schema: z.string().min(2, '姓名至少 2 个字符'),
        validateOn: 'blur',
      }),
    ])

    const form = useForm({ fields })

    await expect(form.validateSingleField('name', 'change')).resolves.toBe(true)
    expect(form.errors.value.name).toBeUndefined()

    await expect(form.validateSingleField('name', 'blur')).resolves.toBe(false)
    expect(form.errors.value.name).toEqual(['姓名至少 2 个字符'])

    form.setValue('name', 'Ada')
    expect(form.errors.value.name).toBeUndefined()

    await expect(form.validateSingleField('name', 'blur')).resolves.toBe(true)
    expect(form.errors.value.name).toBeUndefined()
  })

  it('supports merge and replace value updates with explicit error clearing', async () => {
    const onError = vi.fn()
    const fields = ref([
      defineField({
        field: 'name',
        component: 'input',
        defaultValue: 'default name',
        schema: z.string().min(2, '姓名至少 2 个字符'),
      }),
      defineField({ field: 'age', component: 'input', defaultValue: 18 }),
      defineField({ field: 'obsolete', component: 'input', defaultValue: 'old' }),
    ])

    const form = useForm({ fields, onError })

    form.setValue('name', '')
    await expect(form.validate()).resolves.toBe(false)
    expect(onError).toHaveBeenCalledWith({ name: ['姓名至少 2 个字符'] })

    form.setValues({ name: 'Ada' })
    expect(form.getValue('name')).toBe('Ada')
    expect(form.errors.value.name).toBeUndefined()

    form.setValue('name', '')
    await expect(form.validate()).resolves.toBe(false)
    expect(form.errors.value.name).toEqual(['姓名至少 2 个字符'])

    form.clearFieldError()
    expect(form.errors.value).toEqual({})

    form.setValues({ age: 42 }, true)
    expect(form.getValues()).toEqual({
      age: 42,
      name: 'default name',
      obsolete: 'old',
    })
  })

  it('skips inactive single-field validation unless the field opts into submit validation', async () => {
    const fields = ref([
      defineField({
        field: 'missingValue',
        component: 'input',
        validator: () => '不会校验',
      }),
      defineField({
        field: 'hidden',
        component: 'input',
        defaultValue: 'hidden',
        visible: () => false,
        validator: () => '隐藏字段默认跳过',
      }),
      defineField({
        field: 'disabled',
        component: 'input',
        defaultValue: 'disabled',
        disabled: () => true,
        validator: () => '禁用字段默认跳过',
      }),
      defineField({
        field: 'hiddenRequired',
        component: 'input',
        defaultValue: '',
        visible: () => false,
        submitWhenHidden: true,
        validator: () => '隐藏字段提交时校验',
      }),
    ])

    const form = useForm({ fields })

    await expect(form.validateSingleField('unknown', 'submit')).resolves.toBe(true)
    await expect(form.validateSingleField('hidden', 'submit')).resolves.toBe(true)
    await expect(form.validateSingleField('disabled', 'submit')).resolves.toBe(true)
    expect(form.errors.value).toEqual({})

    await expect(form.validateSingleField('hiddenRequired', 'submit')).resolves.toBe(false)
    expect(form.errors.value.hiddenRequired).toEqual(['隐藏字段提交时校验'])

    form.reset()
    expect(form.getValues()).toEqual({
      disabled: 'disabled',
      hidden: 'hidden',
      hiddenRequired: '',
      missingValue: undefined,
    })
    expect(form.errors.value).toEqual({})
  })
})
