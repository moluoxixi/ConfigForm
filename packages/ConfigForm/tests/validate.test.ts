import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineField } from '../src/models/FieldDef'
import { validateField, validateFieldRules, validateForm } from '../src/utils/validate'

describe('validate utils', () => {
  it('returns no errors for valid schema values', () => {
    expect(validateField('Ada', z.string().min(2))).toEqual([])
  })

  it('returns schema messages and falls back to issue paths when message is empty', () => {
    const schema = z.string().superRefine((_value, ctx) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '',
        path: ['profile', 'name'],
      })
    })

    expect(validateField('Ada', schema)).toEqual(['Validation failed: profile.name'])
  })

  it('merges zod errors with async validator errors', async () => {
    await expect(
      validateFieldRules('', z.string().min(1, '必填'), { name: '' }, async (value, values) => {
        return value === values.name ? ['自定义错误', ''] : undefined
      }),
    ).resolves.toEqual(['必填', '自定义错误'])
  })

  it('validates forms by trigger and respects hidden or disabled submit opt-in', async () => {
    const fields = [
      defineField({ field: 'plain', component: 'input', defaultValue: 'skip' }),
      defineField({
        field: 'name',
        component: 'input',
        schema: z.string().min(2, '姓名至少 2 个字符'),
        validateOn: 'blur',
      }),
      defineField({
        field: 'hiddenSkipped',
        component: 'input',
        visible: () => false,
        validator: () => '隐藏字段默认跳过',
      }),
      defineField({
        field: 'hiddenKept',
        component: 'input',
        visible: () => false,
        submitWhenHidden: true,
        validator: () => '隐藏字段参与提交校验',
      }),
      defineField({
        field: 'disabledSkipped',
        component: 'input',
        disabled: () => true,
        validator: () => '禁用字段默认跳过',
      }),
      defineField({
        field: 'disabledKept',
        component: 'input',
        disabled: () => true,
        submitWhenDisabled: true,
        validator: () => '禁用字段参与提交校验',
      }),
    ]

    const values = {
      disabledKept: '',
      disabledSkipped: '',
      hiddenKept: '',
      hiddenSkipped: '',
      name: '',
      plain: 'skip',
    }

    await expect(validateForm(values, fields, 'change')).resolves.toEqual({})
    await expect(validateForm(values, fields, 'blur')).resolves.toEqual({
      name: ['姓名至少 2 个字符'],
    })
    await expect(validateForm(values, fields, 'submit')).resolves.toEqual({
      disabledKept: ['禁用字段参与提交校验'],
      hiddenKept: ['隐藏字段参与提交校验'],
      name: ['姓名至少 2 个字符'],
    })
  })
})
