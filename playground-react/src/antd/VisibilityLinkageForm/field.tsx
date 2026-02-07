/**
 * 场景 5：显隐联动 (Field 版)
 *
 * 覆盖：
 * - 单字段控制：用户类型切换显示不同字段组
 * - 多字段控制：开关控制多个字段显隐
 * - 嵌套显隐：A 控制 B 显示，B 控制 C 显示
 * - excludeWhenHidden 隐藏时排除提交数据
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，reactions 写在 fieldProps 中。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  userType: 'personal',
  realName: '',
  idCard: '',
  companyName: '',
  taxNumber: '',
  enableNotify: false,
  notifyEmail: '',
  notifyFrequency: undefined,
  hasAddress: false,
  city: '',
  hasDetailAddress: false,
  detailAddress: '',
}

/**
 * 显隐联动示例（Field 版）
 */
export const VisibilityLinkageForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>显隐联动 (Field 版)</Title>
      <Paragraph type="secondary">
        用户类型切换 / 开关控制多字段 / 嵌套显隐（A→B→C） / 隐藏字段排除提交 —— FormField + fieldProps 实现
      </Paragraph>
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
                {/* ---- 场景 A：类型切换显隐 ---- */}
                <FormField name="userType" fieldProps={{
                  label: '用户类型',
                  required: true,
                  component: 'RadioGroup',
                  dataSource: [
                    { label: '个人', value: 'personal' },
                    { label: '企业', value: 'business' },
                  ],
                }}
                />

                {/* 个人字段 */}
                <FormField name="realName" fieldProps={{
                  label: '真实姓名',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入真实姓名' },
                  excludeWhenHidden: true,
                  reactions: [{
                    watch: 'userType',
                    when: v => v[0] === 'personal',
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                <FormField name="idCard" fieldProps={{
                  label: '身份证号',
                  component: 'Input',
                  componentProps: { placeholder: '18 位身份证号' },
                  excludeWhenHidden: true,
                  rules: [{ pattern: /^\d{17}[\dX]$/i, message: '请输入有效身份证号' }],
                  reactions: [{
                    watch: 'userType',
                    when: v => v[0] === 'personal',
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />

                {/* 企业字段 */}
                <FormField name="companyName" fieldProps={{
                  label: '公司名称',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入公司全称' },
                  visible: false,
                  excludeWhenHidden: true,
                  reactions: [{
                    watch: 'userType',
                    when: v => v[0] === 'business',
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                <FormField name="taxNumber" fieldProps={{
                  label: '税号',
                  component: 'Input',
                  componentProps: { placeholder: '纳税人识别号' },
                  visible: false,
                  excludeWhenHidden: true,
                  reactions: [{
                    watch: 'userType',
                    when: v => v[0] === 'business',
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />

                {/* ---- 场景 B：开关控制多字段 ---- */}
                <FormField name="enableNotify" fieldProps={{ label: '开启通知', component: 'Switch' }} />
                <FormField name="notifyEmail" fieldProps={{
                  label: '通知邮箱',
                  component: 'Input',
                  componentProps: { placeholder: '通知邮箱' },
                  visible: false,
                  excludeWhenHidden: true,
                  rules: [{ format: 'email', message: '请输入有效邮箱' }],
                  reactions: [{
                    watch: 'enableNotify',
                    when: v => v[0] === true,
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                <FormField name="notifyFrequency" fieldProps={{
                  label: '通知频率',
                  component: 'Select',
                  visible: false,
                  excludeWhenHidden: true,
                  dataSource: [
                    { label: '实时', value: 'realtime' },
                    { label: '每日', value: 'daily' },
                    { label: '每周', value: 'weekly' },
                  ],
                  reactions: [{
                    watch: 'enableNotify',
                    when: v => v[0] === true,
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />

                {/* ---- 场景 C：嵌套显隐（A→B→C） ---- */}
                <FormField name="hasAddress" fieldProps={{ label: '填写地址', component: 'Switch' }} />
                <FormField name="city" fieldProps={{
                  label: '城市',
                  component: 'Input',
                  componentProps: { placeholder: '请输入城市' },
                  visible: false,
                  excludeWhenHidden: true,
                  reactions: [{
                    watch: 'hasAddress',
                    when: v => v[0] === true,
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                <FormField name="hasDetailAddress" fieldProps={{
                  label: '填写详细地址',
                  component: 'Switch',
                  visible: false,
                  reactions: [{
                    watch: 'hasAddress',
                    when: v => v[0] === true,
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                <FormField name="detailAddress" fieldProps={{
                  label: '详细地址',
                  component: 'Textarea',
                  componentProps: { placeholder: '街道门牌号' },
                  visible: false,
                  excludeWhenHidden: true,
                  reactions: [{
                    watch: ['hasAddress', 'hasDetailAddress'],
                    when: v => v[0] === true && v[1] === true,
                    fulfill: { state: { visible: true } },
                    otherwise: { state: { visible: false } },
                  }],
                }}
                />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
