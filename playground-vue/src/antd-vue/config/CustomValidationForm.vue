<template>
  <div>
    <h2>自定义验证规则</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">正则 / 自定义函数 / 多规则 / 警告级 / 条件规则</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ASpace v-if="mode === 'editable'" style="margin-top: 16px"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ licensePlate: '', phone: '', password: '', age: undefined, idType: 'idcard', idNumber: '', ipAddress: '' })

const WEAK_PWD = ['12345678', 'password', 'qwerty123']

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '150px', pattern: mode.value },
  fields: {
    licensePlate: { type: 'string', label: '车牌号', component: 'Input', wrapper: 'FormItem', placeholder: '京A12345', rules: [{ pattern: /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/, message: '无效车牌号' }] },
    phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '中国大陆手机号', rules: [{ validator: (v: unknown) => { if (!v) return undefined; if (!/^1[3-9]\d{9}$/.test(String(v))) return '无效大陆手机号'; return undefined } }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ stopOnFirstFailure: true, minLength: 8, maxLength: 32, message: '8-32 字符' }, { pattern: /[a-z]/, message: '需含小写' }, { pattern: /[A-Z]/, message: '需含大写' }, { pattern: /\d/, message: '需含数字' }, { validator: (v: unknown) => WEAK_PWD.includes(String(v).toLowerCase()) ? '密码过于简单' : undefined }] },
    age: { type: 'number', label: '年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', rules: [{ min: 0, max: 150, message: '0-150' }, { level: 'warning', validator: (v: unknown) => { const a = Number(v); if (a > 0 && a < 18) return '未成年部分功能受限'; if (a > 60) return '建议开启大字模式'; return undefined } }] },
    idType: { type: 'string', label: '证件类型', required: true, component: 'Select', wrapper: 'FormItem', defaultValue: 'idcard', enum: [{ label: '身份证', value: 'idcard' }, { label: '护照', value: 'passport' }, { label: '军官证', value: 'military' }] },
    idNumber: { type: 'string', label: '证件号码', required: true, component: 'Input', wrapper: 'FormItem', reactions: [{ watch: 'idType', fulfill: { run: (f: any, ctx: any) => { const t = ctx.values.idType as string; f.setValue(''); f.errors = []; if (t === 'idcard') { f.rules = [{ required: true, message: '请输入' }, { pattern: /^\d{17}[\dXx]$/, message: '无效身份证' }]; f.setComponentProps({ placeholder: '18 位身份证' }) } else if (t === 'passport') { f.rules = [{ required: true, message: '请输入' }, { pattern: /^[A-Z]\d{8}$/, message: '格式：E12345678' }]; f.setComponentProps({ placeholder: 'E12345678' }) } else { f.rules = [{ required: true, message: '请输入' }, { minLength: 6, maxLength: 12, message: '6-12 位' }]; f.setComponentProps({ placeholder: '军官证号' }) } } } }] },
    ipAddress: { type: 'string', label: 'IP 地址', component: 'Input', wrapper: 'FormItem', placeholder: '192.168.1.1', rules: [{ validator: (v: unknown) => { if (!v) return undefined; const parts = String(v).split('.'); if (parts.length !== 4) return 'IP 格式错误'; for (const p of parts) { const n = Number(p); if (isNaN(n) || n < 0 || n > 255 || String(n) !== p) return '各段 0-255 整数' } return undefined } }] },
  },
}))
</script>
