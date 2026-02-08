<template>
  <div>
    <h2>卡片分组（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Card 多卡片分组 / void 节点布局 / 卡片内验证 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px">🔐 账户信息</div>
            <FormField name="username" :field-props="{ label: '用户名', required: true, component: 'Input', componentProps: { placeholder: '请输入用户名' }, rules: [{ minLength: 3, message: '至少 3 字符' }] }" />
            <FormField name="password" :field-props="{ label: '密码', required: true, component: 'Password', componentProps: { placeholder: '请输入密码' }, rules: [{ minLength: 8, message: '至少 8 字符' }] }" />
          </div>
          <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px">👤 个人信息</div>
            <FormField name="realName" :field-props="{ label: '真实姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入真实姓名' } }" />
            <FormField name="gender" :field-props="{ label: '性别', component: 'RadioGroup', dataSource: GENDER_OPTIONS }" />
          </div>
          <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px">📞 联系方式</div>
            <FormField name="email" :field-props="{ label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
            <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }" />
            <FormField name="address" :field-props="{ label: '地址', component: 'Textarea', componentProps: { placeholder: '请输入地址' } }" />
          </div>
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()

// ========== 数据 ==========

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { username: '', password: '', realName: '', gender: undefined, email: '', phone: '', address: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
