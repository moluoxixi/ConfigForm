<template>
  <div>
    <h2>嵌套对象（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多级嵌套结构 / void Card 分组可视化 / void 不参与数据路径 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">👤 个人信息</div>
            <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } }" />
            <FormField name="name" :field-props="{ label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } }" />
            <FormField name="age" :field-props="{ label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } } }" />
            <FormField name="gender" :field-props="{ label: '性别', component: 'Select', dataSource: GENDER_OPTIONS, componentProps: { placeholder: '请选择' } }" />
          </div>
          <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">📞 联系方式</div>
            <FormField name="phone" :field-props="{ label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] }" />
            <FormField name="email" :field-props="{ label: '邮箱', component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] }" />
            <FormField name="emergencyName" :field-props="{ label: '紧急联系人', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="emergencyRelation" :field-props="{ label: '关系', component: 'Select', dataSource: RELATION_OPTIONS, componentProps: { placeholder: '请选择' } }" />
            <FormField name="emergencyPhone" :field-props="{ label: '紧急联系电话', component: 'Input', componentProps: { placeholder: '请输入' } }" />
          </div>
          <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">📍 地址</div>
            <FormField name="province" :field-props="{ label: '省份', component: 'Select', dataSource: PROVINCE_OPTIONS, componentProps: { placeholder: '请选择' } }" />
            <FormField name="city" :field-props="{ label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } }" />
            <FormField name="zipCode" :field-props="{ label: '邮编', component: 'Input', componentProps: { placeholder: '请输入邮编' } }" />
            <FormField name="addressDetail" :field-props="{ label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址' } }" />
          </div>
          <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">🏢 公司信息</div>
            <FormField name="companyName" :field-props="{ label: '公司名称', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="department" :field-props="{ label: '部门', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="position" :field-props="{ label: '职位', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="building" :field-props="{ label: '楼栋', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="floor" :field-props="{ label: '楼层', component: 'Input', componentProps: { placeholder: '请输入' } }" />
            <FormField name="seat" :field-props="{ label: '工位号', component: 'Input', componentProps: { placeholder: '请输入' } }" />
          </div>
          <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px">⚙️ 偏好设置</div>
            <FormField name="theme" :field-props="{ label: '主题', component: 'RadioGroup', dataSource: THEME_OPTIONS }" />
            <FormField name="customColor" :field-props="{ label: '自定义颜色', component: 'Input', componentProps: { placeholder: '请输入颜色值' } }" />
            <FormField name="emailNotify" :field-props="{ label: '邮件通知', component: 'Switch' }" />
            <FormField name="smsNotify" :field-props="{ label: '短信通知', component: 'Switch' }" />
            <FormField name="dnd" :field-props="{ label: '免打扰', component: 'Switch' }" />
          </div>
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
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
const GENDER_OPTIONS = [{ label: '男', value: 'male' }, { label: '女', value: 'female' }]

/** 紧急联系人关系选项 */
const RELATION_OPTIONS = [{ label: '配偶', value: 'spouse' }, { label: '父母', value: 'parent' }, { label: '朋友', value: 'friend' }]

/** 省份选项 */
const PROVINCE_OPTIONS = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }]

/** 主题选项 */
const THEME_OPTIONS = [{ label: '亮色', value: 'light' }, { label: '暗色', value: 'dark' }, { label: '自定义', value: 'custom' }]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    title: '员工档案', name: '张三', age: 28, gender: 'male',
    phone: '13800138000', email: 'zhangsan@example.com',
    emergencyName: '李女士', emergencyRelation: 'spouse', emergencyPhone: '13900139000',
    province: 'beijing', city: '北京', zipCode: '100000', addressDetail: '朝阳区某某街道1号',
    companyName: '科技有限公司', department: '研发部', position: '高级工程师',
    building: 'A 栋', floor: '12F', seat: 'A-12-03',
    theme: 'light', customColor: '', emailNotify: true, smsNotify: false, dnd: false,
  },
})

// ========== 联动：主题为「自定义」时显示颜色输入 ==========

/** 初始隐藏 customColor 字段 */
form.getField('customColor')?.setVisible(false)

/** 主题变化 → 控制自定义颜色字段的可见性和必填状态 */
form.onFieldValueChange('theme', (value: unknown) => {
  const field = form.getField('customColor')
  if (!field) return
  const isCustom = value === 'custom'
  field.setVisible(isCustom)
  field.required = isCustom
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
