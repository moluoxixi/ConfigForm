<script setup lang="ts">
/**
 * Element Plus Field 组件模式 - 可编辑表格
 *
 * 覆盖场景：
 * - 基础增删（push / remove）
 * - 排序（moveUp / moveDown）
 * - 行内编辑（使用 Element Plus 组件）
 * - 最大/最小数量限制
 * - 嵌套数组（联系人 → 多个电话号码）
 * - 复制项（duplicate）
 */
import { ref } from 'vue';
import { FormProvider, FormArrayField, useCreateForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import {
  ElInput, ElSelect, ElOption, ElButton, ElButtonGroup, ElCard, ElTag, ElDivider,
} from 'element-plus';
import 'element-plus/dist/index.css';

setupElementPlus();

const form = useCreateForm({
  initialValues: {
    contacts: [
      { name: '张三', role: 'leader', phones: ['13800138001'], email: 'zhangsan@example.com' },
    ],
  },
});

form.createArrayField({
  name: 'contacts',
  label: '联系人',
  minItems: 1,
  maxItems: 5,
  itemTemplate: () => ({ name: '', role: 'member', phones: [''], email: '' }),
});

/** 角色选项 */
const roleOptions = [
  { label: '负责人', value: 'leader' },
  { label: '成员', value: 'member' },
  { label: '备用联系人', value: 'backup' },
];

const submitResult = ref('');

async function handleSubmit(): Promise<void> {
  const result = await form.submit();
  submitResult.value = result.errors.length > 0
    ? '验证失败: ' + result.errors.map((e) => e.message).join(', ')
    : JSON.stringify(result.values, null, 2);
}

/** 获取角色标签类型 */
function getRoleTagType(role: string): 'success' | 'warning' | 'info' {
  if (role === 'leader') return 'success';
  if (role === 'backup') return 'warning';
  return 'info';
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus Field 组件 - 可编辑表格</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      增删改 / 排序 / 复制 / 行内编辑 / 嵌套数组（联系人→多个电话）/ 最大 5 项
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <FormArrayField name="contacts" v-slot="{ field: contactsField }">
          <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">
                  联系人列表
                  <ElTag size="small" type="info" style="margin-left: 8px;">
                    {{ (contactsField.value as unknown[])?.length ?? 0 }} / 5
                  </ElTag>
                </span>
                <ElButton type="primary" size="small" @click="contactsField.push()" :disabled="!contactsField.canAdd">
                  + 添加联系人
                </ElButton>
              </div>
            </template>

            <div
              v-for="(contact, idx) in (contactsField.value as Record<string, unknown>[])"
              :key="idx"
              style="border: 1px solid #ebeef5; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa;"
            >
              <!-- 卡片头部 -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; color: #303133;">联系人 #{{ idx + 1 }}</span>
                  <ElTag size="small" :type="getRoleTagType(contact.role as string)">
                    {{ roleOptions.find((r) => r.value === contact.role)?.label ?? '成员' }}
                  </ElTag>
                </div>
                <ElButtonGroup size="small">
                  <ElButton @click="contactsField.moveUp(idx)" :disabled="idx === 0">↑</ElButton>
                  <ElButton @click="contactsField.moveDown(idx)" :disabled="idx === (contactsField.value as unknown[]).length - 1">↓</ElButton>
                  <ElButton @click="contactsField.duplicate(idx)" :disabled="!contactsField.canAdd">复制</ElButton>
                  <ElButton type="danger" @click="contactsField.remove(idx)" :disabled="!contactsField.canRemove">删除</ElButton>
                </ElButtonGroup>
              </div>

              <!-- 基本信息 -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <el-form-item label="姓名" style="margin-bottom: 0;">
                  <ElInput
                    :model-value="(contact.name as string)"
                    @update:model-value="contactsField.replace(idx, { ...contact, name: $event })"
                    placeholder="请输入姓名"
                  />
                </el-form-item>
                <el-form-item label="角色" style="margin-bottom: 0;">
                  <ElSelect
                    :model-value="(contact.role as string)"
                    @update:model-value="contactsField.replace(idx, { ...contact, role: $event })"
                    style="width: 100%;"
                  >
                    <ElOption v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
                  </ElSelect>
                </el-form-item>
                <el-form-item label="邮箱" style="margin-bottom: 0;">
                  <ElInput
                    :model-value="(contact.email as string)"
                    @update:model-value="contactsField.replace(idx, { ...contact, email: $event })"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>
              </div>

              <!-- 嵌套数组：电话号码 -->
              <div>
                <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px; color: #606266;">电话号码</div>
                <div
                  v-for="(phone, phoneIdx) in (contact.phones as string[])"
                  :key="phoneIdx"
                  style="display: flex; gap: 8px; margin-bottom: 8px;"
                >
                  <ElInput
                    :model-value="phone"
                    @update:model-value="(() => {
                      const phones = [...(contact.phones as string[])];
                      phones[phoneIdx] = $event;
                      contactsField.replace(idx, { ...contact, phones });
                    })()"
                    placeholder="请输入电话号码"
                    style="flex: 1;"
                  />
                  <ElButton
                    type="danger" plain size="default"
                    @click="() => { const phones = (contact.phones as string[]).filter((_, i) => i !== phoneIdx); contactsField.replace(idx, { ...contact, phones }); }"
                    :disabled="(contact.phones as string[]).length <= 1"
                  >
                    删除
                  </ElButton>
                </div>
                <ElButton
                  type="primary" plain size="small"
                  @click="() => { const phones = [...(contact.phones as string[]), '']; contactsField.replace(idx, { ...contact, phones }); }"
                >
                  + 添加电话
                </ElButton>
              </div>
            </div>
          </el-card>
        </FormArrayField>

        <ElButton type="primary" native-type="submit">提交</ElButton>
      </form>
    </FormProvider>

    <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
