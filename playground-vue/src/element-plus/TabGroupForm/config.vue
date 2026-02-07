<template>
  <div>
    <h2>标签页切换分组</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Tabs 分组 / 切换保留数据
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
const savedValues = ref<Record<string, unknown>>({ name: '', email: '', phone: '', company: '', position: '', department: undefined, bio: '', website: '', github: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value },
  layout: { type: 'tabs', tabs: [{ title: '基本信息', fields: ['name', 'email', 'phone'], showErrorBadge: true }, { title: '工作信息', fields: ['company', 'position', 'department'], showErrorBadge: true }, { title: '其他', fields: ['bio', 'website', 'github'] }] },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem' },
    company: { type: 'string', label: '公司', required: true, component: 'Input', wrapper: 'FormItem' },
    position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    department: { type: 'string', label: '部门', component: 'Select', wrapper: 'FormItem', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] },
    bio: { type: 'string', label: '简介', component: 'Textarea', wrapper: 'FormItem', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
    website: { type: 'string', label: '网站', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'url', message: '无效 URL' }] },
    github: { type: 'string', label: 'GitHub', component: 'Input', wrapper: 'FormItem' },
  },
}))
</script>
