<template>
  <div>
    <h2>折叠面板分组</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Collapse 分组 / 默认展开 / 折叠切换
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
const savedValues = ref<Record<string, unknown>>({ name: '', email: '', phone: '', company: '', position: '', salary: undefined, school: '', major: '', degree: undefined, bio: '', hobby: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value },
  layout: { type: 'groups', groups: [{ title: '基本信息', component: 'Collapse', fields: ['name', 'email', 'phone'], collapsed: false }, { title: '工作信息', component: 'Collapse', fields: ['company', 'position', 'salary'] }, { title: '教育经历', component: 'Collapse', fields: ['school', 'major', 'degree'], collapsed: true }, { title: '其他', component: 'Collapse', fields: ['bio', 'hobby'], collapsed: true }] },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem' },
    company: { type: 'string', label: '公司', component: 'Input', wrapper: 'FormItem' },
    position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    salary: { type: 'number', label: '薪资', component: 'InputNumber', wrapper: 'FormItem', componentProps: { min: 0, style: { width: '100%' } } },
    school: { type: 'string', label: '学校', component: 'Input', wrapper: 'FormItem' },
    major: { type: 'string', label: '专业', component: 'Input', wrapper: 'FormItem' },
    degree: { type: 'string', label: '学历', component: 'Select', wrapper: 'FormItem', enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }] },
    bio: { type: 'string', label: '简介', component: 'Textarea', wrapper: 'FormItem' },
    hobby: { type: 'string', label: '爱好', component: 'Input', wrapper: 'FormItem' },
  },
}))
</script>
