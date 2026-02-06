<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 嵌套数组
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      增删改 / 排序 / 复制 / 行内编辑 / 嵌套数组（联系人→多电话）/ 最大 5 项
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <FormArrayField v-slot="{ field: contactsField }" name="contacts">
          <ACard style="margin-bottom: 20px;">
            <template #title>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                  联系人列表
                  <ATag color="blue" style="margin-left: 8px;">{{ (contactsField.value as unknown[])?.length ?? 0 }} / 5</ATag>
                </span>
                <AButton type="primary" size="small" :disabled="!contactsField.canAdd" @click="contactsField.push()">
                  + 添加联系人
                </AButton>
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
                  <ATag :color="getRoleColor(contact.role as string)">
                    {{ roleOptions.find((r) => r.value === contact.role)?.label ?? '成员' }}
                  </ATag>
                </div>
                <ASpace>
                  <AButton size="small" :disabled="idx === 0" @click="contactsField.moveUp(idx)">
                    ↑
                  </AButton>
                  <AButton size="small" :disabled="idx === (contactsField.value as unknown[]).length - 1" @click="contactsField.moveDown(idx)">
                    ↓
                  </AButton>
                  <AButton size="small" :disabled="!contactsField.canAdd" @click="contactsField.duplicate(idx)">
                    复制
                  </AButton>
                  <AButton size="small" danger :disabled="!contactsField.canRemove" @click="contactsField.remove(idx)">
                    删除
                  </AButton>
                </ASpace>
              </div>

              <!-- 基本信息 -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <AFormItem label="姓名" style="margin-bottom: 0;">
                  <AInput :value="(contact.name as string)" placeholder="请输入姓名" @update:value="contactsField.replace(idx, { ...contact, name: $event })" />
                </AFormItem>
                <AFormItem label="角色" style="margin-bottom: 0;">
                  <ASelect :value="(contact.role as string)" style="width: 100%;" :options="roleOptions" @update:value="contactsField.replace(idx, { ...contact, role: $event })" />
                </AFormItem>
                <AFormItem label="邮箱" style="margin-bottom: 0;">
                  <AInput :value="(contact.email as string)" placeholder="请输入邮箱" @update:value="contactsField.replace(idx, { ...contact, email: $event })" />
                </AFormItem>
              </div>

              <!-- 嵌套数组：电话号码 -->
              <div>
                <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px; color: rgba(0,0,0,0.65);">
                  电话号码
                </div>
                <div v-for="(phone, phoneIdx) in (contact.phones as string[])" :key="phoneIdx" style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <AInput
                    :value="phone"
                    placeholder="请输入电话号码"
                    style="flex: 1;" @update:value="(() => { const phones = [...(contact.phones as string[])]; phones[phoneIdx] = $event; contactsField.replace(idx, { ...contact, phones }); })()"
                  />
                  <AButton
                    danger
                    :disabled="(contact.phones as string[]).length <= 1"
                    @click="() => { const phones = (contact.phones as string[]).filter((_, i) => i !== phoneIdx); contactsField.replace(idx, { ...contact, phones }); }"
                  >
                    删除
                  </AButton>
                </div>
                <AButton type="dashed" size="small" @click="() => { const phones = [...(contact.phones as string[]), '']; contactsField.replace(idx, { ...contact, phones }); }">
                  + 添加电话
                </AButton>
              </div>
            </div>
          </ACard>
        </FormArrayField>

        <AButton type="primary" html-type="submit">
          提交
        </AButton>
      </form>
    </FormProvider>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Select as ASelect, Space as ASpace, Tag as ATag } from 'ant-design-vue'
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
import { ref } from 'vue'

setupAntdVue()

const form = useCreateForm({
  initialValues: {
    contacts: [
      { name: '张三', role: 'leader', phones: ['13800138001'], email: 'zhangsan@example.com' },
    ],
  },
})

form.createArrayField({
  name: 'contacts',
  label: '联系人',
  minItems: 1,
  maxItems: 5,
  itemTemplate: () => ({ name: '', role: 'member', phones: [''], email: '' }),
})

/** 角色选项 */
const roleOptions = [
  { label: '负责人', value: 'leader' },
  { label: '成员', value: 'member' },
  { label: '备用联系人', value: 'backup' },
]

const submitResult = ref('')

async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  submitResult.value = result.errors.length > 0
    ? `验证失败: ${result.errors.map(e => e.message).join(', ')}`
    : JSON.stringify(result.values, null, 2)
}

/** 获取角色标签颜色 */
function getRoleColor(role: string): string {
  if (role === 'leader')
    return 'green'
  if (role === 'backup')
    return 'orange'
  return 'blue'
}
</script>
