import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 5：显隐联动
 *
 * 覆盖：
 * - 单字段控制：用户类型切换显示不同字段组
 * - 多字段控制：开关控制多个字段显隐
 * - 嵌套显隐：A 控制 B 显示，B 控制 C 显示
 * - excludeWhenHidden 隐藏时排除提交数据
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px' },
  properties: {
    /* ---- 场景 A：类型切换显隐 ---- */
    userType: {
      type: 'string',
      title: '用户类型',
      required: true,
      component: 'RadioGroup',
      default: 'personal',
      enum: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'business' },
      ],
    },

    /* 个人字段 */
    realName: {
      type: 'string',
      title: '真实姓名',
      required: true,
      placeholder: '请输入真实姓名',
      excludeWhenHidden: true,
      reactions: [
        {
          watch: 'userType',
          when: v => v[0] === 'personal',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    idCard: {
      type: 'string',
      title: '身份证号',
      placeholder: '18 位身份证号',
      excludeWhenHidden: true,
      rules: [{ pattern: /^\d{17}[\dX]$/i, message: '请输入有效身份证号' }],
      reactions: [
        {
          watch: 'userType',
          when: v => v[0] === 'personal',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* 企业字段 */
    companyName: {
      type: 'string',
      title: '公司名称',
      required: true,
      placeholder: '请输入公司全称',
      visible: false,
      excludeWhenHidden: true,
      reactions: [
        {
          watch: 'userType',
          when: v => v[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    taxNumber: {
      type: 'string',
      title: '税号',
      placeholder: '纳税人识别号',
      visible: false,
      excludeWhenHidden: true,
      reactions: [
        {
          watch: 'userType',
          when: v => v[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* ---- 场景 B：开关控制多字段 ---- */
    enableNotify: {
      type: 'boolean',
      title: '开启通知',
      default: false,
    },
    notifyEmail: {
      type: 'string',
      title: '通知邮箱',
      placeholder: '通知邮箱',
      visible: false,
      excludeWhenHidden: true,
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
      reactions: [
        {
          watch: 'enableNotify',
          when: v => v[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    notifyFrequency: {
      type: 'string',
      title: '通知频率',
      visible: false,
      excludeWhenHidden: true,
      enum: [
        { label: '实时', value: 'realtime' },
        { label: '每日', value: 'daily' },
        { label: '每周', value: 'weekly' },
      ],
      reactions: [
        {
          watch: 'enableNotify',
          when: v => v[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* ---- 场景 C：嵌套显隐（A→B→C） ---- */
    hasAddress: {
      type: 'boolean',
      title: '填写地址',
      default: false,
    },
    city: {
      type: 'string',
      title: '城市',
      placeholder: '请输入城市',
      visible: false,
      excludeWhenHidden: true,
      reactions: [
        {
          watch: 'hasAddress',
          when: v => v[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    hasDetailAddress: {
      type: 'boolean',
      title: '填写详细地址',
      visible: false,
      default: false,
      reactions: [
        {
          watch: 'hasAddress',
          when: v => v[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    detailAddress: {
      type: 'string',
      title: '详细地址',
      component: 'Textarea',
      placeholder: '街道门牌号',
      visible: false,
      excludeWhenHidden: true,
      reactions: [
        {
          watch: ['hasAddress', 'hasDetailAddress'],
          when: v => v[0] === true && v[1] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
  },
}

/**
 * 显隐联动示例
 */
export const VisibilityLinkageForm = observer((): React.ReactElement => {
  return (
    <div>
      <h2>显隐联动</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        用户类型切换 / 开关控制多字段 / 嵌套显隐（A→B→C） / 隐藏字段排除提交
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
