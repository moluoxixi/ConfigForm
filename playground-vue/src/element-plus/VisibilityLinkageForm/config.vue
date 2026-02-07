<template>
  <div>
    <h2>显隐联动</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">用户类型切换 / 开关控制多字段 / 嵌套显隐</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><el-space v-if="mode === 'editable'" style="margin-top: 16px"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space></template>
    </ConfigForm>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :title="result.startsWith('验证失败') ? '验证失败' : '提交成功'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ userType: 'personal', realName: '', idCard: '', companyName: '', taxNumber: '', enableNotify: false, notifyEmail: '', notifyFrequency: undefined, hasAddress: false, city: '', hasDetailAddress: false, detailAddress: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '140px', pattern: mode.value },
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
}))
</script>
