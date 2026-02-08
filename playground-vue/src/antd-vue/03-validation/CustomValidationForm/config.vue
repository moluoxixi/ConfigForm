<template>
  <div>
    <h2>自定义验证规则</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      正则 / 自定义函数 / 多规则 / 警告级 / 条件规则
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
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = { licensePlate: '', phone: '', password: '', age: undefined, idType: 'idcard', idNumber: '', ipAddress: '' }

const WEAK_PWD = ['12345678', 'password', 'qwerty123']

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '150px' },
  properties: {
    licensePlate: { type: 'string', title: '车牌号', placeholder: '京A12345', rules: [{ pattern: /^[\u4E00-\u9FA5][A-Z][A-Z0-9]{5}$/, message: '无效车牌号' }] },
    phone: { type: 'string', title: '手机号', required: true, placeholder: '中国大陆手机号', rules: [{ validator: (v: unknown) => {
      if (!v)
        return undefined
      if (!/^1[3-9]\d{9}$/.test(String(v)))
        return '无效大陆手机号'
      return undefined
    } }] },
    password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ stopOnFirstFailure: true, minLength: 8, maxLength: 32, message: '8-32 字符' }, { pattern: /[a-z]/, message: '需含小写' }, { pattern: /[A-Z]/, message: '需含大写' }, { pattern: /\d/, message: '需含数字' }, { validator: (v: unknown) => WEAK_PWD.includes(String(v).toLowerCase()) ? '密码过于简单' : undefined }] },
    age: { type: 'number', title: '年龄', required: true, rules: [{ min: 0, max: 150, message: '0-150' }, { level: 'warning', validator: (v: unknown) => {
      const a = Number(v)
      if (a > 0 && a < 18)
        return '未成年部分功能受限'
      if (a > 60)
        return '建议开启大字模式'
      return undefined
    } }] },
    idType: { type: 'string', title: '证件类型', required: true, default: 'idcard', enum: [{ label: '身份证', value: 'idcard' }, { label: '护照', value: 'passport' }, { label: '军官证', value: 'military' }] },
    idNumber: { type: 'string', title: '证件号码', required: true, reactions: [{ watch: 'idType', fulfill: { run: (f: any, ctx: any) => {
      const t = ctx.values.idType as string
      f.setValue('')
      f.errors = []
      if (t === 'idcard') {
        f.rules = [{ required: true, message: '请输入' }, { pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }]
        f.setComponentProps({ placeholder: '18 位身份证' })
      }
      else if (t === 'passport') {
        f.rules = [{ required: true, message: '请输入' }, { pattern: /^[A-Z]\d{8}$/, message: '格式：E12345678' }]
        f.setComponentProps({ placeholder: 'E12345678' })
      }
      else {
        f.rules = [{ required: true, message: '请输入' }, { minLength: 6, maxLength: 12, message: '6-12 位' }]
        f.setComponentProps({ placeholder: '军官证号' })
      }
    } } }] },
    ipAddress: { type: 'string', title: 'IP 地址', placeholder: '192.168.1.1', rules: [{ validator: (v: unknown) => {
      if (!v)
        return undefined
      const parts = String(v).split('.')
      if (parts.length !== 4)
        return 'IP 格式错误'
      for (const p of parts) {
        const n = Number(p)
        if (Number.isNaN(n) || n < 0 || n > 255 || String(n) !== p)
          return '各段 0-255 整数'
      }
      return undefined
    } }] },
  },
}
</script>
