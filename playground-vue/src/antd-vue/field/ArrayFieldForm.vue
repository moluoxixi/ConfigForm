<script setup lang="ts">
/**
 * Ant Design Vue Field 组件模式 - 嵌套数组
 *
 * 覆盖场景：
 * - 嵌套数组（联系人 → 多电话号码）
 * - 行内编辑（a-input / a-select）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大/最小数量限制
 */
import { ref } from 'vue';
import { FormProvider, FormArrayField, useCreateForm } from '@moluoxixi/vue';
import { setupAntdVue } from '@moluoxixi/ui-antd-vue';

setupAntdVue();

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

/** 获取角色标签颜色 */
function getRoleColor(role: string): string {
  if (role === 'leader') return 'green';
  if (role === 'backup') return 'orange';
  return 'blue';
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Ant Design Vue Field 组件 - 嵌套数组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      增删改 / 排序 / 复制 / 行内编辑 / 嵌套数组（联系人→多电话）/ 最大 5 项
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <FormArrayField name="contacts" v-slot="{ field: contactsField }">
          <a-card style="margin-bottom: 20px;">
            <template #title>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                  联系人列表
                  <a-tag color="blue" style="margin-left: 8px;">{{ (contactsField.value as unknown[])?.length ?? 0 }} / 5</a-tag>
                </span>
                <a-button type="primary" size="small" @click="contactsField.push()" :disabled="!contactsField.canAdd">+ 添加联系人</a-button>
              </div>
            </template>

            <div
              v-for="(contact, idx) in (contactsField.value as Record<string, unknown>[])"
              :key="idx"
              style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa;"
            >
              <!-- 卡片头部 -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600;">联系人 #{{ idx + 1 }}</span>
                  <a-tag :color="getRoleColor(contact.role as string)">
                    {{ roleOptions.find((r) => r.value === contact.role)?.label ?? '成员' }}
                  </a-tag>
                </div>
                <a-space>
                  <a-button size="small" @click="contactsField.moveUp(idx)" :disabled="idx === 0">↑</a-button>
                  <a-button size="small" @click="contactsField.moveDown(idx)" :disabled="idx === (contactsField.value as unknown[]).length - 1">↓</a-button>
                  <a-button size="small" @click="contactsField.duplicate(idx)" :disabled="!contactsField.canAdd">复制</a-button>
                  <a-button size="small" danger @click="contactsField.remove(idx)" :disabled="!contactsField.canRemove">删除</a-button>
                </a-space>
              </div>

              <!-- 基本信息 -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <a-form-item label="姓名" style="margin-bottom: 0;">
                  <a-input :value="(contact.name as string)" @update:value="contactsField.replace(idx, { ...contact, name: $event })" placeholder="请输入姓名" />
                </a-form-item>
                <a-form-item label="角色" style="margin-bottom: 0;">
                  <a-select :value="(contact.role as string)" @update:value="contactsField.replace(idx, { ...contact, role: $event })" style="width: 100%;" :options="roleOptions" />
                </a-form-item>
                <a-form-item label="邮箱" style="margin-bottom: 0;">
                  <a-input :value="(contact.email as string)" @update:value="contactsField.replace(idx, { ...contact, email: $event })" placeholder="请输入邮箱" />
                </a-form-item>
              </div>

              <!-- 嵌套数组：电话号码 -->
              <div>
                <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px; color: rgba(0,0,0,0.65);">电话号码</div>
                <div v-for="(phone, phoneIdx) in (contact.phones as string[])" :key="phoneIdx" style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <a-input
                    :value="phone"
                    @update:value="(() => { const phones = [...(contact.phones as string[])]; phones[phoneIdx] = $event; contactsField.replace(idx, { ...contact, phones }); })()"
                    placeholder="请输入电话号码" style="flex: 1;"
                  />
                  <a-button danger
                    @click="() => { const phones = (contact.phones as string[]).filter((_, i) => i !== phoneIdx); contactsField.replace(idx, { ...contact, phones }); }"
                    :disabled="(contact.phones as string[]).length <= 1"
                  >删除</a-button>
                </div>
                <a-button type="dashed" size="small" @click="() => { const phones = [...(contact.phones as string[]), '']; contactsField.replace(idx, { ...contact, phones }); }">
                  + 添加电话
                </a-button>
              </div>
            </div>
          </a-card>
        </FormArrayField>

        <a-button type="primary" html-type="submit">提交</a-button>
      </form>
    </FormProvider>

    <a-card v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </a-card>
  </div>
</template>
