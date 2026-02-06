<script setup lang="ts">
/**
 * Element Plus 纯配置模式 - 分步表单
 *
 * 覆盖场景：
 * - el-steps 分步导航
 * - 步骤验证（当前步骤字段通过后才能前进）
 * - 栅格布局（一行两列）
 * - 分组 Card
 * - 预览汇总页
 * - 提交前拦截（confirm）
 */
import { ref } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import {
  ElSteps, ElStep, ElButton, ElCard, ElDescriptions, ElDescriptionsItem,
  ElMessage, ElMessageBox, ElInput, ElSelect, ElOption, ElDatePicker,
} from 'element-plus';
import 'element-plus/dist/index.css';

setupElementPlus();

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
  { title: '基本信息', icon: 'User', fields: ['name', 'gender', 'idNumber', 'birthDate'] },
  { title: '联系方式', icon: 'Message', fields: ['phone', 'email', 'province', 'address'] },
  { title: '职业信息', icon: 'Briefcase', fields: ['occupation', 'company', 'salary', 'bio'] },
  { title: '预览确认', icon: 'Check', fields: [] },
];
const submitResult = ref('');

/** 步骤验证后前进 */
async function nextStep(): Promise<void> {
  let hasError = false;
  for (const fieldName of steps[currentStep.value].fields) {
    const field = form.getField(fieldName);
    if (field) {
      const errors = await field.validate('submit');
      if (errors.length > 0) {
        hasError = true;
        break;
      }
    }
  }
  if (!hasError) {
    currentStep.value++;
  } else {
    ElMessage.warning('请先完成当前步骤的必填项');
  }
}

function prevStep(): void {
  currentStep.value--;
}

/** 提交（含拦截） */
async function handleSubmit(): Promise<void> {
  try {
    await ElMessageBox.confirm('确认提交所有信息？提交后将无法修改。', '提交确认', {
      confirmButtonText: '确认提交',
      cancelButtonText: '返回修改',
      type: 'info',
    });
    const result = await form.submit();
    if (result.errors.length > 0) {
      submitResult.value = '验证失败: ' + result.errors.map((e) => e.message).join(', ');
    } else {
      submitResult.value = JSON.stringify(result.values, null, 2);
      ElMessage.success('提交成功！');
    }
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus 纯配置 - 分步表单</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      el-steps 导航 / 步骤验证 / 栅格布局 / 预览汇总 / 提交前拦截
    </p>

    <!-- 步骤导航 -->
    <ElSteps :active="currentStep" finish-status="success" style="margin-bottom: 24px;">
      <ElStep v-for="step in steps" :key="step.title" :title="step.title" />
    </ElSteps>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- 步骤内容 -->
        <template v-for="(step, stepIdx) in steps" :key="stepIdx">
          <el-card v-show="stepIdx === currentStep && stepIdx < 3" shadow="never">
            <template #header>
              <span style="font-weight: 600;">{{ step.title }}</span>
            </template>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px;">
              <FormField v-for="fieldName in step.fields" :key="fieldName" :name="fieldName" v-slot="{ field }">
                <el-form-item
                  :label="field.label"
                  :required="field.required"
                  :error="field.errors.length > 0 ? field.errors[0].message : ''"
                  style="margin-bottom: 18px;"
                >
                  <!-- 下拉选择 -->
                  <ElSelect
                    v-if="field.dataSource.length > 0"
                    :model-value="(field.value as string)"
                    @update:model-value="field.setValue($event)"
                    placeholder="请选择" style="width: 100%;"
                  >
                    <ElOption v-for="item in field.dataSource" :key="String(item.value)" :label="item.label" :value="item.value" />
                  </ElSelect>
                  <!-- 日期选择 -->
                  <ElDatePicker
                    v-else-if="fieldName === 'birthDate'"
                    :model-value="(field.value as string)"
                    @update:model-value="field.setValue($event)"
                    type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%;"
                  />
                  <!-- 文本域 -->
                  <ElInput
                    v-else-if="fieldName === 'bio'"
                    type="textarea" :rows="3"
                    :model-value="(field.value as string)"
                    @update:model-value="field.setValue($event)"
                    :placeholder="`请输入${field.label}`"
                  />
                  <!-- 普通输入 -->
                  <ElInput
                    v-else
                    :model-value="(field.value as string)"
                    @update:model-value="field.setValue($event)"
                    @blur="field.blur(); field.validate('blur')"
                    :placeholder="`请输入${field.label}`"
                  />
                </el-form-item>
              </FormField>
            </div>
          </el-card>
        </template>

        <!-- 预览确认页 -->
        <el-card v-show="currentStep === 3" shadow="never">
          <template #header><span style="font-weight: 600;">信息预览</span></template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="姓名">{{ form.values.name }}</ElDescriptionsItem>
            <ElDescriptionsItem label="性别">{{ form.values.gender === 'male' ? '男' : '女' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="证件号码">{{ form.values.idNumber }}</ElDescriptionsItem>
            <ElDescriptionsItem label="出生日期">{{ form.values.birthDate || '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="手机号">{{ form.values.phone }}</ElDescriptionsItem>
            <ElDescriptionsItem label="邮箱">{{ form.values.email }}</ElDescriptionsItem>
            <ElDescriptionsItem label="省份">{{ form.values.province || '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="详细地址">{{ form.values.address }}</ElDescriptionsItem>
            <ElDescriptionsItem label="职业">{{ form.values.occupation || '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="公司">{{ form.values.company || '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="期望薪资">{{ form.values.salary || '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="个人简介">{{ form.values.bio || '—' }}</ElDescriptionsItem>
          </ElDescriptions>
        </el-card>

        <!-- 导航按钮 -->
        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
          <ElButton v-if="currentStep > 0" @click="prevStep">上一步</ElButton>
          <div v-else />
          <ElButton v-if="currentStep < steps.length - 1" type="primary" @click="nextStep">下一步</ElButton>
          <ElButton v-else type="success" native-type="submit">确认提交</ElButton>
        </div>
      </form>
    </FormProvider>

    <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
