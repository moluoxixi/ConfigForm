<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 级联联动
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      省市区三级联动（a-select）+ 联系方式类型切换验证规则
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- 地址级联 -->
        <ACard style="margin-bottom: 20px;">
          <template #title>
            地址信息（三级联动）
          </template>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <FormField v-slot="{ field }" name="province">
              <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
                <ASelect
                  :value="(field.value as string) || undefined" placeholder="请选择省份" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                  @update:value="field.setValue($event)"
                />
              </AFormItem>
            </FormField>

            <FormField v-slot="{ field }" name="city">
              <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
                <ASelect
                  :value="(field.value as string) || undefined" :disabled="field.dataSource.length === 0"
                  :placeholder="field.dataSource.length === 0 ? '请先选择省份' : '请选择城市'" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                  @update:value="field.setValue($event)"
                />
              </AFormItem>
            </FormField>

            <FormField v-slot="{ field }" name="district">
              <AFormItem :label="field.label">
                <ASelect
                  :value="(field.value as string) || undefined" :disabled="field.dataSource.length === 0"
                  :placeholder="field.dataSource.length === 0 ? '请先选择城市' : '请选择区县'" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                  @update:value="field.setValue($event)"
                />
              </AFormItem>
            </FormField>
          </div>
        </ACard>

        <!-- 联系方式联动 -->
        <ACard style="margin-bottom: 20px;">
          <template #title>
            联系方式（类型切换联动）
          </template>

          <FormField v-slot="{ field }" name="contactType">
            <AFormItem :label="field.label">
              <ARadioGroup :value="(field.value as string)" @update:value="field.setValue($event)">
                <ARadio v-for="item in field.dataSource" :key="String(item.value)" :value="item.value">
                  {{ item.label }}
                </ARadio>
              </ARadioGroup>
            </AFormItem>
          </FormField>

          <FormField v-slot="{ field }" name="contact">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput
                :value="(field.value as string)" :placeholder="(field.componentProps.placeholder as string) ?? '请输入'" @update:value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
              />
            </AFormItem>
          </FormField>
        </ACard>

        <AButton type="primary" html-type="submit">
          提交
        </AButton>
      </form>
    </FormProvider>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <template #title>
        <strong>结果</strong>
      </template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Radio as ARadio, RadioGroup as ARadioGroup, Select as ASelect } from 'ant-design-vue'
/**
 * Ant Design Vue Field 组件模式 - 级联联动
 *
 * 演示：编程式联动，FormField + reactions 配置
 * - 省市区三级联动（a-select）
 * - 联系方式类型切换（手机/邮箱/微信）→ 动态切换验证规则和 placeholder
 */
import { ref } from 'vue'

setupAntdVue()

const form = useCreateForm({
  initialValues: { province: '', city: '', district: '', contactType: 'phone', contact: '' },
})

/** 模拟省市区数据 */
const provinceData: Record<string, Record<string, string[]>> = {
  北京: { 朝阳区: ['三里屯', '国贸', '望京'], 海淀区: ['中关村', '五道口', '西二旗'], 东城区: ['王府井', '东直门', '崇文门'] },
  上海: { 浦东新区: ['陆家嘴', '张江', '金桥'], 黄浦区: ['外滩', '南京路', '人民广场'], 徐汇区: ['徐家汇', '漕河泾', '田林'] },
  广东: { 广州: ['天河', '越秀', '荔湾'], 深圳: ['南山', '福田', '宝安'], 东莞: ['莞城', '南城', '东城'] },
}

/* 省份字段 */
form.createField({
  name: 'province',
  label: '省份',
  required: true,
  dataSource: Object.keys(provinceData).map(p => ({ label: p, value: p })),
})

/* 城市字段 - 联动省份 */
form.createField({
  name: 'city',
  label: '城市',
  required: true,
  reactions: [{
    watch: 'province',
    fulfill: {
      run: (field, ctx) => {
        const province = ctx.values.province as string
        const cities = province ? Object.keys(provinceData[province] ?? {}) : []
        field.setDataSource(cities.map(c => ({ label: c, value: c })))
        field.setValue('')
      },
    },
  }],
})

/* 区县字段 - 联动城市 */
form.createField({
  name: 'district',
  label: '区县',
  reactions: [{
    watch: 'city',
    fulfill: {
      run: (field, ctx) => {
        const province = ctx.values.province as string
        const city = ctx.values.city as string
        const districts = (province && city) ? (provinceData[province]?.[city] ?? []) : []
        field.setDataSource(districts.map(d => ({ label: d, value: d })))
        field.setValue('')
      },
    },
  }],
})

/* 联系方式类型 */
form.createField({
  name: 'contactType',
  label: '联系方式类型',
  dataSource: [{ label: '手机号', value: 'phone' }, { label: '邮箱', value: 'email' }, { label: '微信号', value: 'wechat' }],
})

/* 联系方式值 - 联动类型切换验证 */
form.createField({
  name: 'contact',
  label: '联系方式',
  required: true,
  reactions: [{
    watch: 'contactType',
    fulfill: {
      run: (field, ctx) => {
        const type = ctx.values.contactType as string
        field.rules = [{ required: true }]
        if (type === 'phone') {
          field.rules.push({ format: 'phone', message: '请输入正确的手机号' })
          field.setComponentProps({ placeholder: '请输入 11 位手机号' })
        }
        else if (type === 'email') {
          field.rules.push({ format: 'email', message: '请输入正确的邮箱' })
          field.setComponentProps({ placeholder: '请输入邮箱地址' })
        }
        else {
          field.rules.push({ minLength: 6, message: '微信号至少 6 个字符' })
          field.setComponentProps({ placeholder: '请输入微信号' })
        }
        field.setValue('')
        field.errors = []
      },
    },
  }],
})

const submitResult = ref('')

async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.errors.length > 0) {
    submitResult.value = `验证失败:\n${result.errors.map(e => `  ${e.path}: ${e.message}`).join('\n')}`
  }
  else {
    submitResult.value = JSON.stringify(result.values, null, 2)
  }
}
</script>
