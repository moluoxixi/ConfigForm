<template>
  <div>
    <h2>嵌套对象</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      一级嵌套 / 多层嵌套 / 嵌套内联动
    </p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = `验证失败:\n${e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')}`">
      <template #default="{ form }">
        <el-space v-if="mode === 'editable'" style="margin-top: 16px">
          <el-button type="primary" native-type="submit">
            提交
          </el-button><el-button @click="form.reset()">
            重置
          </el-button>
        </el-space>
      </template>
    </ConfigForm>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ title: '', profile: { name: '', age: undefined, gender: undefined, contact: { phone: '', email: '' }, address: { province: undefined, city: '', detail: '' } }, company: { name: '', department: '', position: '' }, settings: { theme: 'light', customColor: '' } })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '160px', pattern: mode.value },
  fields: {
    'title': { type: 'string', label: '标题', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入标题' },
    'profile.name': { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入' },
    'profile.age': { type: 'number', label: '年龄', component: 'InputNumber', wrapper: 'FormItem', componentProps: { min: 0, max: 150, style: { width: '100%' } } },
    'profile.gender': { type: 'string', label: '性别', component: 'Select', wrapper: 'FormItem', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    'profile.contact.phone': { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }] },
    'profile.contact.email': { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    'profile.address.province': { type: 'string', label: '省份', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }] },
    'profile.address.city': { type: 'string', label: '城市', component: 'Input', wrapper: 'FormItem' },
    'profile.address.detail': { type: 'string', label: '详细地址', component: 'Textarea', wrapper: 'FormItem' },
    'company.name': { type: 'string', label: '公司名称', component: 'Input', wrapper: 'FormItem' },
    'company.department': { type: 'string', label: '部门', component: 'Input', wrapper: 'FormItem' },
    'company.position': { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    'settings.theme': { type: 'string', label: '主题', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'light', enum: [{ label: '亮色', value: 'light' }, { label: '暗色', value: 'dark' }, { label: '自定义', value: 'custom' }] },
    'settings.customColor': { type: 'string', label: '自定义颜色', component: 'Input', wrapper: 'FormItem', placeholder: '#1677ff', visible: false, reactions: [{ watch: 'settings.theme', when: (v: unknown[]) => v[0] === 'custom', fulfill: { state: { visible: true, required: true } }, otherwise: { state: { visible: false, required: false } } }] },
  },
}))
</script>
