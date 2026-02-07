<template>
  <div>
    <h2>级联选择（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      省市区三级联动 / 多级分类联动 - FormField + fieldProps 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="province" :field-props="{ label: '省份', required: true, component: 'Select', dataSource: PROVINCES, componentProps: { placeholder: '请选择' } }" />
          <FormField name="city" :field-props="{ label: '城市', required: true, component: 'Select', componentProps: { placeholder: '请先选择省份' } }" />
          <FormField name="district" :field-props="{ label: '区县', component: 'Select', componentProps: { placeholder: '请先选择城市' } }" />
          <FormField name="categoryL1" :field-props="{ label: '一级分类', required: true, component: 'Select', dataSource: CAT_L1, componentProps: { placeholder: '请选择' } }" />
          <FormField name="categoryL2" :field-props="{ label: '二级分类', required: true, component: 'Select', componentProps: { placeholder: '请先选择一级' } }" />
          <FormField name="categoryL3" :field-props="{ label: '三级分类', component: 'Select', componentProps: { placeholder: '请先选择二级' } }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
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

// ========== 省市区数据 ==========

/** 省份列表 */
const PROVINCES = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }]

/** 城市列表（按省份分组） */
const CITIES: Record<string, Array<{ label: string; value: string }>> = {
  beijing: [{ label: '东城区', value: 'dongcheng' }, { label: '朝阳区', value: 'chaoyang' }],
  shanghai: [{ label: '黄浦区', value: 'huangpu' }, { label: '浦东新区', value: 'pudong' }],
  guangdong: [{ label: '广州', value: 'guangzhou' }, { label: '深圳', value: 'shenzhen' }],
}

/** 区县列表（按城市分组） */
const DISTRICTS: Record<string, Array<{ label: string; value: string }>> = {
  chaoyang: [{ label: '三里屯', value: 'sanlitun' }, { label: '望京', value: 'wangjing' }],
  guangzhou: [{ label: '天河区', value: 'tianhe' }, { label: '越秀区', value: 'yuexiu' }],
  shenzhen: [{ label: '南山区', value: 'nanshan' }, { label: '福田区', value: 'futian' }],
}

// ========== 分类数据 ==========

/** 一级分类 */
const CAT_L1 = [{ label: '电子产品', value: 'electronics' }, { label: '服装', value: 'clothing' }]

/** 二级分类（按一级分组） */
const CAT_L2: Record<string, Array<{ label: string; value: string }>> = {
  electronics: [{ label: '手机', value: 'phone' }, { label: '电脑', value: 'computer' }],
  clothing: [{ label: '男装', value: 'men' }, { label: '女装', value: 'women' }],
}

/** 三级分类（按二级分组） */
const CAT_L3: Record<string, Array<{ label: string; value: string }>> = {
  phone: [{ label: 'iPhone', value: 'iphone' }, { label: '华为', value: 'huawei' }],
  computer: [{ label: '笔记本', value: 'laptop' }, { label: '台式机', value: 'desktop' }],
}

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { province: undefined, city: undefined, district: undefined, categoryL1: undefined, categoryL2: undefined, categoryL3: undefined },
})

// ========== 省市区级联 ==========

/** 省份变化 → 更新城市列表并清空城市、区县 */
form.onFieldValueChange('province', (value: unknown) => {
  const field = form.getField('city')
  if (!field) return
  const p = value as string
  field.setValue(undefined)
  field.setDataSource(p ? (CITIES[p] ?? []) : [])
  field.setComponentProps({ placeholder: p ? '请选择城市' : '请先选择省份' })
})

/** 城市变化 → 更新区县列表并清空区县 */
form.onFieldValueChange('city', (value: unknown) => {
  const field = form.getField('district')
  if (!field) return
  const c = value as string
  field.setValue(undefined)
  field.setDataSource(c ? (DISTRICTS[c] ?? []) : [])
  field.setComponentProps({ placeholder: c ? '请选择区县' : '请先选择城市' })
})

// ========== 分类级联 ==========

/** 一级分类变化 → 更新二级列表并清空二级、三级 */
form.onFieldValueChange('categoryL1', (value: unknown) => {
  const field = form.getField('categoryL2')
  if (!field) return
  const l1 = value as string
  field.setValue(undefined)
  field.setDataSource(l1 ? (CAT_L2[l1] ?? []) : [])
})

/** 二级分类变化 → 更新三级列表并清空三级 */
form.onFieldValueChange('categoryL2', (value: unknown) => {
  const field = form.getField('categoryL3')
  if (!field) return
  const l2 = value as string
  field.setValue(undefined)
  field.setDataSource(l2 ? (CAT_L3[l2] ?? []) : [])
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
