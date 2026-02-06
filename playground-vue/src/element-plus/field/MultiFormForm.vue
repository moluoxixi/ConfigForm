<script setup lang="ts">
/**
 * Element Plus Field 组件模式 - 多表单协作
 *
 * 覆盖场景：
 * - 子表单（独立验证 + 值汇总）
 * - 多表单联合提交
 * - 跨表单联动（表单A的值影响表单B）
 * - el-dialog 弹窗表单
 */
import { ref } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import {
  ElInput, ElSelect, ElOption, ElButton, ElFormItem, ElCard,
  ElDialog, ElMessage, ElDivider, ElTag, ElResult,
} from 'element-plus';
import 'element-plus/dist/index.css';

setupElementPlus();

/* ======== 表单 1：基本信息 ======== */
const basicForm = useCreateForm({
  initialValues: { name: '', email: '', phone: '' },
});
basicForm.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '姓名至少 2 个字符' }] });
basicForm.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email' }] });
basicForm.createField({ name: 'phone', label: '手机号', rules: [{ format: 'phone' }] });

/* ======== 表单 2：地址信息 ======== */
const addressForm = useCreateForm({
  initialValues: { province: '', city: '', detail: '' },
});
addressForm.createField({
  name: 'province', label: '省份', required: true,
  dataSource: [
    { label: '北京', value: '北京' },
    { label: '上海', value: '上海' },
    { label: '广东', value: '广东' },
    { label: '浙江', value: '浙江' },
  ],
});
addressForm.createField({ name: 'city', label: '城市', required: true });
addressForm.createField({ name: 'detail', label: '详细地址', required: true });

/* 跨表单联动：province 变化时清空 city */
const provinceField = addressForm.getField('province');
if (provinceField) {
  provinceField.onValueChange(() => {
    const cityField = addressForm.getField('city');
    if (cityField) cityField.setValue('');
  });
}

/* ======== 弹窗表单 ======== */
const showDialog = ref(false);
const dialogForm = useCreateForm({
  initialValues: { note: '', priority: 'normal', assignee: '' },
});
dialogForm.createField({ name: 'note', label: '备注内容', required: true, rules: [{ minLength: 5, message: '备注至少 5 个字符' }] });
dialogForm.createField({
  name: 'priority', label: '优先级',
  dataSource: [
    { label: '紧急', value: 'urgent' },
    { label: '普通', value: 'normal' },
    { label: '低', value: 'low' },
  ],
});
dialogForm.createField({ name: 'assignee', label: '指派给', placeholder: '可选' });
const dialogResult = ref('');

const submitResult = ref('');

/** 联合提交两个表单 */
async function handleCombinedSubmit(): Promise<void> {
  const [basicResult, addressResult] = await Promise.all([
    basicForm.submit(),
    addressForm.submit(),
  ]);

  const allErrors = [...basicResult.errors, ...addressResult.errors];
  if (allErrors.length > 0) {
    submitResult.value = '验证失败:\n' + allErrors.map((e) => `  ${e.path}: ${e.message}`).join('\n');
    ElMessage.error('部分表单验证失败');
  } else {
    submitResult.value = JSON.stringify({
      basic: basicResult.values,
      address: addressResult.values,
    }, null, 2);
    ElMessage.success('联合提交成功！');
  }
}

/** 弹窗表单提交 */
async function handleDialogSubmit(): Promise<void> {
  const result = await dialogForm.submit();
  if (result.errors.length > 0) {
    ElMessage.warning('请完善弹窗表单');
    return;
  }
  dialogResult.value = JSON.stringify(result.values, null, 2);
  showDialog.value = false;
  ElMessage.success('弹窗表单提交成功');
}

/** 打开弹窗时重置 */
function openDialog(): void {
  dialogForm.reset();
  showDialog.value = true;
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus Field 组件 - 多表单协作</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      两个独立表单联合提交 / 跨表单联动 / el-dialog 弹窗表单
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- 表单 1：基本信息 -->
      <el-card shadow="never">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600;">基本信息表单</span>
            <ElTag size="small" type="primary">表单 A</ElTag>
          </div>
        </template>
        <FormProvider :form="basicForm">
          <FormField name="name" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请输入姓名"
              />
            </ElFormItem>
          </FormField>
          <FormField name="email" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请输入邮箱"
              />
            </ElFormItem>
          </FormField>
          <FormField name="phone" v-slot="{ field }">
            <ElFormItem :label="field.label" :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
                placeholder="选填"
              />
            </ElFormItem>
          </FormField>
        </FormProvider>
      </el-card>

      <!-- 表单 2：地址信息 -->
      <el-card shadow="never">
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600;">地址信息表单</span>
            <ElTag size="small" type="success">表单 B</ElTag>
          </div>
        </template>
        <FormProvider :form="addressForm">
          <FormField name="province" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElSelect
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                placeholder="请选择省份" style="width: 100%;"
              >
                <ElOption v-for="item in field.dataSource" :key="String(item.value)" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem>
          </FormField>
          <FormField name="city" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
                placeholder="切换省份会自动清空"
              />
            </ElFormItem>
          </FormField>
          <FormField name="detail" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请输入详细地址"
              />
            </ElFormItem>
          </FormField>
        </FormProvider>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <ElButton type="primary" @click="handleCombinedSubmit">联合提交两个表单</ElButton>
      <ElButton type="warning" @click="openDialog">打开弹窗表单</ElButton>
    </div>

    <!-- el-dialog 弹窗表单 -->
    <ElDialog v-model="showDialog" title="弹窗表单" width="500px" destroy-on-close>
      <FormProvider :form="dialogForm">
        <FormField name="note" v-slot="{ field }">
          <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
            <ElInput
              type="textarea" :rows="3"
              :model-value="(field.value as string)"
              @update:model-value="field.setValue($event)"
              placeholder="请输入备注（至少 5 个字符）"
            />
          </ElFormItem>
        </FormField>
        <FormField name="priority" v-slot="{ field }">
          <ElFormItem :label="field.label">
            <ElSelect
              :model-value="(field.value as string)"
              @update:model-value="field.setValue($event)"
              style="width: 100%;"
            >
              <ElOption v-for="item in field.dataSource" :key="String(item.value)" :label="item.label" :value="item.value" />
            </ElSelect>
          </ElFormItem>
        </FormField>
        <FormField name="assignee" v-slot="{ field }">
          <ElFormItem :label="field.label">
            <ElInput
              :model-value="(field.value as string)"
              @update:model-value="field.setValue($event)"
              placeholder="请输入负责人姓名"
            />
          </ElFormItem>
        </FormField>
      </FormProvider>
      <template #footer>
        <ElButton @click="showDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleDialogSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 弹窗结果 -->
    <el-card v-if="dialogResult" shadow="never" style="margin-bottom: 20px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong>弹窗表单结果</strong>
          <ElTag size="small" type="warning">Dialog</ElTag>
        </div>
      </template>
      <pre style="margin: 0; font-size: 13px;">{{ dialogResult }}</pre>
    </el-card>

    <!-- 联合提交结果 -->
    <el-card v-if="submitResult" shadow="never">
      <template #header><strong>联合提交结果</strong></template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
