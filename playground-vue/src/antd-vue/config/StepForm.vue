<script setup lang="ts">
/**
 * Ant Design Vue 纯配置模式 - 分步表单
 *
 * 覆盖场景：
 * - a-steps 分步导航
 * - 步骤验证（当前步骤字段通过后才能前进）
 * - 栅格布局（一行两列）
 * - Card 分组
 * - 预览模式
 * - 提交前拦截（Modal.confirm）
 */
import { ref } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupAntdVue } from '@moluoxixi/ui-antd-vue';
import { message, Modal } from 'ant-design-vue';

setupAntdVue();

const form = useCreateForm({
  initialValues: {
    /* Step 1: 基本信息 */
    name: '', gender: 'male', idNumber: '', birthDate: '',
    /* Step 2: 联系方式 */
    phone: '', email: '', province: '', address: '',
    /* Step 3: 职业信息 */
    occupation: '', company: '', salary: '', bio: '',
  },
});

/* Step 1 字段 */
form.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '姓名至少 2 个字符' }] });
form.createField({ name: 'gender', label: '性别', dataSource: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] });
form.createField({ name: 'idNumber', label: '证件号码', required: true });
form.createField({ name: 'birthDate', label: '出生日期' });

/* Step 2 字段 */
form.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone' }] });
form.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email' }] });
form.createField({
  name: 'province', label: '省份',
  dataSource: [
    { label: '北京', value: '北京' }, { label: '上海', value: '上海' },
    { label: '广东', value: '广东' }, { label: '浙江', value: '浙江' },
  ],
});
form.createField({ name: 'address', label: '详细地址', required: true });

/* Step 3 字段 */
form.createField({ name: 'occupation', label: '职业' });
form.createField({ name: 'company', label: '公司' });
form.createField({ name: 'salary', label: '期望薪资' });
form.createField({ name: 'bio', label: '个人简介' });

const currentStep = ref(0);
const steps = [
  { title: '基本信息', fields: ['name', 'gender', 'idNumber', 'birthDate'] },
  { title: '联系方式', fields: ['phone', 'email', 'province', 'address'] },
  { title: '职业信息', fields: ['occupation', 'company', 'salary', 'bio'] },
  { title: '预览确认', fields: [] },
];
const submitResult = ref('');

/** 步骤验证后前进 */
async function nextStep(): Promise<void> {
  let hasError = false;
  for (const fieldName of steps[currentStep.value].fields) {
    const field = form.getField(fieldName);
    if (field) {
      const errors = await field.validate('submit');
      if (errors.length > 0) { hasError = true; break; }
    }
  }
  if (!hasError) {
    currentStep.value++;
  } else {
    message.warning('请先完成当前步骤的必填项');
  }
}

function prevStep(): void {
  currentStep.value--;
}

/** 提交（含拦截） */
async function handleSubmit(): Promise<void> {
  Modal.confirm({
    title: '提交确认',
    content: '确认提交所有信息？提交后将无法修改。',
    okText: '确认提交',
    cancelText: '返回修改',
    async onOk() {
      const result = await form.submit();
      if (result.errors.length > 0) {
        submitResult.value = '验证失败: ' + result.errors.map((e) => e.message).join(', ');
      } else {
        submitResult.value = JSON.stringify(result.values, null, 2);
        message.success('提交成功！');
      }
    },
  });
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Ant Design Vue 纯配置 - 分步表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      a-steps 导航 / 步骤验证 / 栅格布局 / 预览汇总 / 提交前拦截
    </p>

    <!-- 步骤导航 -->
    <a-steps :current="currentStep" style="margin-bottom: 24px;">
      <a-step v-for="step in steps" :key="step.title" :title="step.title" />
    </a-steps>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- 步骤内容 -->
        <template v-for="(step, stepIdx) in steps" :key="stepIdx">
          <a-card v-show="stepIdx === currentStep && stepIdx < 3">
            <template #title>{{ step.title }}</template>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px;">
              <FormField v-for="fieldName in step.fields" :key="fieldName" :name="fieldName" v-slot="{ field }">
                <a-form-item
                  :label="field.label"
                  :required="field.required"
                  :validate-status="field.errors.length > 0 ? 'error' : ''"
                  :help="field.errors[0]?.message"
                  style="margin-bottom: 18px;"
                >
                  <!-- 下拉选择 -->
                  <a-select
                    v-if="field.dataSource.length > 0"
                    :value="(field.value as string) || undefined"
                    @update:value="field.setValue($event)"
                    placeholder="请选择" style="width: 100%;"
                    :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                  />
                  <!-- 日期选择 -->
                  <a-date-picker
                    v-else-if="fieldName === 'birthDate'"
                    :value="(field.value as string) || undefined"
                    @update:value="field.setValue($event)"
                    placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%;"
                  />
                  <!-- 文本域 -->
                  <a-textarea
                    v-else-if="fieldName === 'bio'"
                    :value="(field.value as string)"
                    @update:value="field.setValue($event)"
                    :rows="3" :placeholder="`请输入${field.label}`"
                  />
                  <!-- 普通输入 -->
                  <a-input
                    v-else
                    :value="(field.value as string)"
                    @update:value="field.setValue($event)"
                    @blur="field.blur(); field.validate('blur')"
                    :placeholder="`请输入${field.label}`"
                  />
                </a-form-item>
              </FormField>
            </div>
          </a-card>
        </template>

        <!-- 预览确认页 -->
        <a-card v-show="currentStep === 3">
          <template #title>信息预览</template>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="姓名">{{ form.values.name }}</a-descriptions-item>
            <a-descriptions-item label="性别">{{ form.values.gender === 'male' ? '男' : '女' }}</a-descriptions-item>
            <a-descriptions-item label="证件号码">{{ form.values.idNumber }}</a-descriptions-item>
            <a-descriptions-item label="出生日期">{{ form.values.birthDate || '—' }}</a-descriptions-item>
            <a-descriptions-item label="手机号">{{ form.values.phone }}</a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ form.values.email }}</a-descriptions-item>
            <a-descriptions-item label="省份">{{ form.values.province || '—' }}</a-descriptions-item>
            <a-descriptions-item label="详细地址">{{ form.values.address }}</a-descriptions-item>
            <a-descriptions-item label="职业">{{ form.values.occupation || '—' }}</a-descriptions-item>
            <a-descriptions-item label="公司">{{ form.values.company || '—' }}</a-descriptions-item>
            <a-descriptions-item label="期望薪资">{{ form.values.salary || '—' }}</a-descriptions-item>
            <a-descriptions-item label="个人简介">{{ form.values.bio || '—' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 导航按钮 -->
        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
          <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
          <div v-else />
          <a-button v-if="currentStep < steps.length - 1" type="primary" @click="nextStep">下一步</a-button>
          <a-button v-else type="primary" html-type="submit">确认提交</a-button>
        </div>
      </form>
    </FormProvider>

    <a-card v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </a-card>
  </div>
</template>
