<template>
  <div>
    <h2>必填与格式验证</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      required / email / phone / URL / pattern / min-max
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
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :title="result.startsWith('验证失败') ? '验证失败' : '提交成功'" :description="result" show-icon style="margin-top: 16px" />
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
const savedValues = ref<Record<string, unknown>>({ username: '', email: '', phone: '', website: '', nickname: '', age: undefined, zipCode: '', idCard: '', password: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '140px', pattern: mode.value },
  fields: {
    username: { type: 'string', label: '用户名（必填）', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入', rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }] },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '11 位手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
    website: { type: 'string', label: '个人网站', component: 'Input', wrapper: 'FormItem', placeholder: 'https://...', rules: [{ format: 'url', message: '无效 URL' }] },
    nickname: { type: 'string', label: '昵称', component: 'Input', wrapper: 'FormItem', placeholder: '2-10 字符', rules: [{ minLength: 2, message: '至少 2 字符' }, { maxLength: 10, message: '最多 10 字符' }] },
    age: { type: 'number', label: '年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', rules: [{ min: 1, max: 150, message: '1-150' }] },
    zipCode: { type: 'string', label: '邮编', component: 'Input', wrapper: 'FormItem', placeholder: '6 位数字', rules: [{ pattern: /^\d{6}$/, message: '6 位数字' }] },
    idCard: { type: 'string', label: '身份证号', component: 'Input', wrapper: 'FormItem', placeholder: '18 位', rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', placeholder: '8-32 位', rules: [{ minLength: 8, maxLength: 32, message: '8-32 字符' }, { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需含大小写和数字' }] },
  },
}))
</script>
