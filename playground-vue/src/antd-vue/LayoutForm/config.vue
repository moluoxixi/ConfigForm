<template>
  <div>
    <h2>表单布局</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      水平 / 垂直 / 行内 / 栅格布局
    </p>
    <div style="margin-bottom: 16px">
      <span style="font-weight: 600; margin-right: 12px">布局类型：</span>
      <div style="display: inline-flex">
        <button
          v-for="(opt, idx) in LAYOUT_OPTIONS" :key="opt.value"
          :style="{ padding: '4px 12px', fontSize: '13px', border: '1px solid #d9d9d9', background: layoutType === opt.value ? '#1677ff' : '#fff', color: layoutType === opt.value ? '#fff' : 'rgba(0,0,0,0.88)', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === LAYOUT_OPTIONS.length - 1 ? '0 4px 4px 0' : '0', position: 'relative', zIndex: layoutType === opt.value ? 1 : 0 }"
          @click="layoutType = opt.value as LayoutType"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 场景 2：表单布局（Ant Design Vue）
 */
import { computed, ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const LAYOUT_OPTIONS = [{ label: '水平', value: 'horizontal' }, { label: '垂直', value: 'vertical' }, { label: '行内', value: 'inline' }, { label: '栅格两列', value: 'grid-2col' }]

type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col'

const layoutType = ref<LayoutType>('horizontal')

const initialValues = { name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' }

const PROPERTIES: ISchema['properties'] = {
  name: { type: 'string', title: '姓名', required: true, placeholder: '请输入姓名' },
  email: { type: 'string', title: '邮箱', required: true, placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
  phone: { type: 'string', title: '手机号', placeholder: '请输入手机号' },
  department: { type: 'string', title: '部门', component: 'Select', placeholder: '请选择', enum: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }] },
  role: { type: 'string', title: '职位', placeholder: '请输入职位' },
  joinDate: { type: 'string', title: '入职日期', component: 'DatePicker' },
}

const schema = computed<ISchema>(() => {
  const s: ISchema = { type: 'object', decoratorProps: { labelWidth: '100px', actions: { submit: '提交', reset: '重置' } }, properties: { ...PROPERTIES } }
  switch (layoutType.value) {
    case 'horizontal': s.decoratorProps!.labelPosition = 'right'
      s.decoratorProps!.direction = 'vertical'
      break
    case 'vertical': s.decoratorProps!.labelPosition = 'top'
      s.decoratorProps!.direction = 'vertical'
      break
    case 'inline': s.decoratorProps!.labelPosition = 'right'
      s.decoratorProps!.direction = 'inline'
      break
    case 'grid-2col': s.decoratorProps!.labelPosition = 'right'
      s.layout = { type: 'grid', columns: 2, gutter: 24 }
      break
  }
  return s
})
</script>
