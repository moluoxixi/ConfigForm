<template>
  <div>
    <h2>基础表单</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
    </p>

    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>

    <ConfigForm
      :key="mode"
      :schema="schema"
      :initial-values="savedValues"
      @values-change="(v: Record<string, unknown>) => savedValues = v"
      @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)"
      @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')"
    >
      <template #default="{ form }">
        <el-space v-if="mode === 'editable'" style="margin-top: 16px">
          <el-button type="primary" native-type="submit">提交</el-button>
          <el-button @click="form.reset()">重置</el-button>
        </el-space>
      </template>
    </ConfigForm>

    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :title="result.startsWith('验证失败') ? '验证失败' : '提交成功'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
/**
 * 场景 1：基础表单（Element Plus）
 *
 * 覆盖全部注册组件类型 + 三种模式切换
 */
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
]

const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({
  username: '', password: '', email: '', phone: '', age: 18,
  gender: undefined, marital: 'single', hobbies: [], notification: true, birthday: '', bio: '',
})

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value },
  fields: {
    username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入用户名', rules: [{ minLength: 3, maxLength: 20, message: '3-20 个字符' }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', placeholder: '请输入密码', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
    age: { type: 'number', label: '年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 18, componentProps: { min: 0, max: 150 } },
    gender: { type: 'string', label: '性别', component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    marital: { type: 'string', label: '婚姻状况', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'single', enum: [{ label: '未婚', value: 'single' }, { label: '已婚', value: 'married' }] },
    hobbies: { type: 'array', label: '爱好', component: 'CheckboxGroup', wrapper: 'FormItem', defaultValue: [], enum: [{ label: '阅读', value: 'reading' }, { label: '运动', value: 'sports' }, { label: '编程', value: 'coding' }] },
    notification: { type: 'boolean', label: '接收通知', component: 'Switch', wrapper: 'FormItem', defaultValue: true },
    birthday: { type: 'string', label: '生日', component: 'DatePicker', wrapper: 'FormItem', placeholder: '请选择日期' },
    bio: { type: 'string', label: '个人简介', component: 'Textarea', wrapper: 'FormItem', placeholder: '不超过 200 字', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
  },
}))
</script>
