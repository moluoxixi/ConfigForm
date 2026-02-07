<template>
  <div>
    <h2>表单布局</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      水平 / 垂直 / 行内 / 栅格布局
    </p>

    <el-space direction="vertical" :style="{ width: '100%', marginBottom: '16px' }">
      <div>
        <span style="font-weight: 600; margin-right: 12px">表单模式：</span><el-radio-group v-model="mode" size="small">
          <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <span style="font-weight: 600; margin-right: 12px">布局类型：</span><el-radio-group v-model="layoutType" size="small">
          <el-radio-button v-for="opt in LAYOUT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-space>

    <el-divider />

    <ConfigForm
      :key="`${layoutType}-${mode}`"
      :schema="schema"
      :initial-values="savedValues"
      @values-change="(v: Record<string, unknown>) => savedValues = v"
      @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)"
      @submit-failed="(e: any[]) => result = `验证失败:\n${e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')}`"
    >
      <template #default="{ form }">
        <el-space v-if="mode === 'editable'" style="margin-top: 16px">
          <el-button type="primary" native-type="submit">
            提交
          </el-button>
          <el-button @click="form.reset()">
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
/**
 * 场景 2：表单布局（Element Plus）
 */
import { computed, ref } from 'vue'

setupElementPlus()

const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const LAYOUT_OPTIONS = [{ label: '水平', value: 'horizontal' }, { label: '垂直', value: 'vertical' }, { label: '行内', value: 'inline' }, { label: '栅格两列', value: 'grid-2col' }]

type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col'

const mode = ref<FieldPattern>('editable')
const layoutType = ref<LayoutType>('horizontal')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' })

const FIELDS: FormSchema['fields'] = {
  name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名' },
  email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
  phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号' },
  department: { type: 'string', label: '部门', component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }] },
  role: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem', placeholder: '请输入职位' },
  joinDate: { type: 'string', label: '入职日期', component: 'DatePicker', wrapper: 'FormItem' },
}

const schema = computed<FormSchema>(() => {
  const s: FormSchema = { form: { pattern: mode.value, labelWidth: '100px' }, fields: { ...FIELDS } }
  switch (layoutType.value) {
    case 'horizontal': s.form!.labelPosition = 'right'
      s.form!.direction = 'vertical'
      break
    case 'vertical': s.form!.labelPosition = 'top'
      s.form!.direction = 'vertical'
      break
    case 'inline': s.form!.labelPosition = 'right'
      s.form!.direction = 'inline'
      break
    case 'grid-2col': s.form!.labelPosition = 'right'
      s.layout = { type: 'grid', columns: 2, gutter: 24 }
      break
  }
  return s
})
</script>
