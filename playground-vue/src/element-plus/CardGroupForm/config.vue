<template>
  <div>
    <h2>卡片分组</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Card 多卡片分组布局
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
const savedValues = ref<Record<string, unknown>>({ username: '', password: '', confirmPwd: '', realName: '', gender: undefined, birthday: '', email: '', phone: '', address: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value },
  layout: { type: 'groups', groups: [{ title: '账户信息', component: 'Card', fields: ['username', 'password', 'confirmPwd'] }, { title: '个人信息', component: 'Card', fields: ['realName', 'gender', 'birthday'] }, { title: '联系方式', component: 'Card', fields: ['email', 'phone', 'address'] }] },
  fields: {
    username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 3, message: '至少 3 字符' }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    confirmPwd: { type: 'string', label: '确认密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => v !== ctx.getFieldValue('password') ? '密码不一致' : undefined, trigger: 'blur' }] },
    realName: { type: 'string', label: '真实姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    gender: { type: 'string', label: '性别', component: 'RadioGroup', wrapper: 'FormItem', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    birthday: { type: 'string', label: '生日', component: 'DatePicker', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }] },
    address: { type: 'string', label: '地址', component: 'Textarea', wrapper: 'FormItem' },
  },
}))
</script>
