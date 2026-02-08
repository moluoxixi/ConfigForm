/**
 * 场景 6：值联动 (Field 版)
 *
 * 覆盖：
 * - 单向同步：字段 A 变化，字段 B 自动跟随
 * - 格式转换：输入值自动转换（大写、去空格）
 * - 映射转换：根据 A 的值查表设置 B 的值
 * - 多对一：多个字段聚合到一个显示字段
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，reactions 写在 fieldProps 中。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
setupAntd()

/** 国家→区号映射 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  china: '+86',
  usa: '+1',
  japan: '+81',
  korea: '+82',
  uk: '+44',
}

/** 国家→货币映射 */
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  china: 'CNY',
  usa: 'USD',
  japan: 'JPY',
  korea: 'KRW',
  uk: 'GBP',
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  firstName: '',
  lastName: '',
  fullName: '',
  rawInput: '',
  upperCase: '',
  trimmed: '',
  country: 'china',
  areaCode: '+86',
  currency: 'CNY',
  province: '',
  city: '',
  district: '',
  fullAddress: '',
}

/**
 * 值联动示例（Field 版）
 */
export const ValueLinkageForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <h2>值联动 (Field 版)</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        单向同步（姓+名→全名） / 格式转换（大写、去空格） / 映射转换（国家→区号/货币） / 多对一聚合 —— FormField + fieldProps 实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                {/* ---- 场景 A：单向同步 ---- */}
                <FormField name="firstName" fieldProps={{ label: '姓', component: 'Input', componentProps: { placeholder: '请输入姓' } }} />
                <FormField name="lastName" fieldProps={{ label: '名', component: 'Input', componentProps: { placeholder: '请输入名' } }} />
                <FormField name="fullName" fieldProps={{
                  label: '全名（自动拼接）',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '自动由「姓」+「名」拼接',
                  reactions: [{
                    watch: ['firstName', 'lastName'],
                    fulfill: {
                      run: (field, ctx) => {
                        const first = (ctx.values.firstName as string) ?? ''
                        const last = (ctx.values.lastName as string) ?? ''
                        field.setValue(`${first}${last}`.trim())
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 B：格式转换 ---- */}
                <FormField name="rawInput" fieldProps={{ label: '输入文本', component: 'Input', componentProps: { placeholder: '输入任意文本' } }} />
                <FormField name="upperCase" fieldProps={{
                  label: '大写转换',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '自动将输入转为大写',
                  reactions: [{
                    watch: 'rawInput',
                    fulfill: {
                      run: (field, ctx) => {
                        const raw = (ctx.values.rawInput as string) ?? ''
                        field.setValue(raw.toUpperCase())
                      },
                    },
                  }],
                }}
                />
                <FormField name="trimmed" fieldProps={{
                  label: '去空格结果',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '自动去除首尾空格',
                  reactions: [{
                    watch: 'rawInput',
                    fulfill: {
                      run: (field, ctx) => {
                        const raw = (ctx.values.rawInput as string) ?? ''
                        field.setValue(raw.trim())
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 C：映射转换 ---- */}
                <FormField name="country" fieldProps={{
                  label: '国家',
                  component: 'Select',
                  dataSource: [
                    { label: '中国', value: 'china' },
                    { label: '美国', value: 'usa' },
                    { label: '日本', value: 'japan' },
                    { label: '韩国', value: 'korea' },
                    { label: '英国', value: 'uk' },
                  ],
                }}
                />
                <FormField name="areaCode" fieldProps={{
                  label: '区号（自动映射）',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '根据国家自动映射区号',
                  reactions: [{
                    watch: 'country',
                    fulfill: {
                      run: (field, ctx) => {
                        const c = (ctx.values.country as string) ?? ''
                        field.setValue(COUNTRY_CODE_MAP[c] ?? '')
                      },
                    },
                  }],
                }}
                />
                <FormField name="currency" fieldProps={{
                  label: '货币（自动映射）',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '根据国家自动映射货币',
                  reactions: [{
                    watch: 'country',
                    fulfill: {
                      run: (field, ctx) => {
                        const c = (ctx.values.country as string) ?? ''
                        field.setValue(COUNTRY_CURRENCY_MAP[c] ?? '')
                      },
                    },
                  }],
                }}
                />

                {/* ---- 场景 D：多对一聚合 ---- */}
                <FormField name="province" fieldProps={{ label: '省', component: 'Input', componentProps: { placeholder: '省' } }} />
                <FormField name="city" fieldProps={{ label: '市', component: 'Input', componentProps: { placeholder: '市' } }} />
                <FormField name="district" fieldProps={{ label: '区', component: 'Input', componentProps: { placeholder: '区' } }} />
                <FormField name="fullAddress" fieldProps={{
                  label: '完整地址（聚合）',
                  component: 'Input',
                  componentProps: { disabled: true },
                  description: '自动由 省 + 市 + 区 聚合',
                  reactions: [{
                    watch: ['province', 'city', 'district'],
                    fulfill: {
                      run: (field, ctx) => {
                        const parts = [
                          ctx.values.province as string,
                          ctx.values.city as string,
                          ctx.values.district as string,
                        ].filter(Boolean)
                        field.setValue(parts.join(' '))
                      },
                    },
                  }],
                }}
                />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
