<template>
  <div>
    <h2>显隐联动</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      用户类型切换 / 开关控制多字段 / 嵌套显隐 — ConfigForm + ISchema 实现
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
 * 显隐联动 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现显隐联动：
 * - 用户类型切换（个人/企业 显示不同字段）
 * - 开关控制多字段显隐
 * - 嵌套显隐（地址 → 详细地址）
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  userType: 'personal', realName: '', idCard: '', companyName: '', taxNumber: '',
  enableNotify: false, notifyEmail: '', notifyFrequency: undefined,
  hasAddress: false, city: '', hasDetailAddress: false, detailAddress: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    userType: {
      type: 'string', title: '用户类型', required: true, default: 'personal', component: 'RadioGroup',
      enum: [{ label: '个人', value: 'personal' }, { label: '企业', value: 'business' }],
    },
    realName: {
      type: 'string', title: '真实姓名', required: true,
      componentProps: { placeholder: '请输入' }, excludeWhenHidden: true,
      reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    idCard: {
      type: 'string', title: '身份证号',
      componentProps: { placeholder: '18 位' }, excludeWhenHidden: true,
      rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }],
      reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    companyName: {
      type: 'string', title: '公司名称', required: true,
      componentProps: { placeholder: '请输入' }, visible: false, excludeWhenHidden: true,
      reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    taxNumber: {
      type: 'string', title: '税号',
      componentProps: { placeholder: '请输入' }, visible: false, excludeWhenHidden: true,
      reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    enableNotify: { type: 'boolean', title: '开启通知', default: false, component: 'Switch' },
    notifyEmail: {
      type: 'string', title: '通知邮箱',
      componentProps: { placeholder: '邮箱' }, visible: false, excludeWhenHidden: true,
      rules: [{ format: 'email', message: '无效邮箱' }],
      reactions: [{ watch: 'enableNotify', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    notifyFrequency: {
      type: 'string', title: '通知频率', component: 'Select', visible: false, excludeWhenHidden: true,
      enum: [{ label: '实时', value: 'realtime' }, { label: '每日', value: 'daily' }, { label: '每周', value: 'weekly' }],
      reactions: [{ watch: 'enableNotify', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    hasAddress: { type: 'boolean', title: '填写地址', default: false, component: 'Switch' },
    city: {
      type: 'string', title: '城市', visible: false, excludeWhenHidden: true,
      reactions: [{ watch: 'hasAddress', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    hasDetailAddress: {
      type: 'boolean', title: '填写详细地址', default: false, component: 'Switch', visible: false,
      reactions: [{ watch: 'hasAddress', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
    detailAddress: {
      type: 'string', title: '详细地址', component: 'Textarea', visible: false, excludeWhenHidden: true,
      reactions: [{ watch: ['hasAddress', 'hasDetailAddress'], when: (v: unknown[]) => v[0] === true && v[1] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }],
    },
  },
}
</script>
