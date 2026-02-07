<template>
  <div>
    <h2>显隐联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">用户类型切换 / 开关控制多字段 / 嵌套显隐</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { userType: 'personal', realName: '', idCard: '', companyName: '', taxNumber: '', enableNotify: false, notifyEmail: '', notifyFrequency: undefined, hasAddress: false, city: '', hasDetailAddress: false, detailAddress: '' }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '140px' },
  fields: {
    userType: { type: 'string', label: '用户类型', required: true, component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'personal', enum: [{ label: '个人', value: 'personal' }, { label: '企业', value: 'business' }] },
    realName: { type: 'string', label: '真实姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入', excludeWhenHidden: true, reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    idCard: { type: 'string', label: '身份证号', component: 'Input', wrapper: 'FormItem', placeholder: '18 位', excludeWhenHidden: true, rules: [{ pattern: /^\d{17}[\dXx]$/, message: '无效身份证' }], reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'personal', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    companyName: { type: 'string', label: '公司名称', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入', visible: false, excludeWhenHidden: true, reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    taxNumber: { type: 'string', label: '税号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入', visible: false, excludeWhenHidden: true, reactions: [{ watch: 'userType', when: (v: unknown[]) => v[0] === 'business', fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    enableNotify: { type: 'boolean', label: '开启通知', component: 'Switch', wrapper: 'FormItem', defaultValue: false },
    notifyEmail: { type: 'string', label: '通知邮箱', component: 'Input', wrapper: 'FormItem', placeholder: '邮箱', visible: false, excludeWhenHidden: true, rules: [{ format: 'email', message: '无效邮箱' }], reactions: [{ watch: 'enableNotify', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    notifyFrequency: { type: 'string', label: '通知频率', component: 'Select', wrapper: 'FormItem', visible: false, excludeWhenHidden: true, enum: [{ label: '实时', value: 'realtime' }, { label: '每日', value: 'daily' }, { label: '每周', value: 'weekly' }], reactions: [{ watch: 'enableNotify', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    hasAddress: { type: 'boolean', label: '填写地址', component: 'Switch', wrapper: 'FormItem', defaultValue: false },
    city: { type: 'string', label: '城市', component: 'Input', wrapper: 'FormItem', visible: false, excludeWhenHidden: true, reactions: [{ watch: 'hasAddress', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    hasDetailAddress: { type: 'boolean', label: '填写详细地址', component: 'Switch', wrapper: 'FormItem', visible: false, defaultValue: false, reactions: [{ watch: 'hasAddress', when: (v: unknown[]) => v[0] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
    detailAddress: { type: 'string', label: '详细地址', component: 'Textarea', wrapper: 'FormItem', visible: false, excludeWhenHidden: true, reactions: [{ watch: ['hasAddress', 'hasDetailAddress'], when: (v: unknown[]) => v[0] === true && v[1] === true, fulfill: { state: { visible: true } }, otherwise: { state: { visible: false } } }] },
  },
}
</script>
