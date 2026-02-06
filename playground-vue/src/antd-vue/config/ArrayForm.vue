<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue 纯配置 - 数组字段
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      增删改 / 排序 / 复制 / 最大10项最小1项 / 项内联动（勾选折扣显示折扣率）/ 汇总金额
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- 订单名 -->
        <FormField v-slot="{ field }" name="orderName">
          <AFormItem
            :label="field.label" required
            :validate-status="field.errors.length > 0 ? 'error' : ''"
            :help="field.errors[0]?.message"
          >
            <AInput
              :value="(field.value as string)"
              placeholder="请输入订单名称"
              @update:value="field.setValue($event)"
            />
          </AFormItem>
        </FormField>

        <!-- 数组字段 -->
        <FormArrayField v-slot="{ field: arrayField }" name="items">
          <ACard style="margin-bottom: 20px;">
            <template #title>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                  订单项
                  <ATag color="blue" style="margin-left: 8px;">
                    {{ (arrayField.value as unknown[])?.length ?? 0 }} / 10
                  </ATag>
                </span>
                <AButton type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push()">
                  + 添加
                </AButton>
              </div>
            </template>

            <!-- 表头 -->
            <div style="display: grid; grid-template-columns: 2fr 100px 120px 70px 100px 100px 180px; gap: 8px; font-size: 13px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; color: rgba(0,0,0,0.65);">
              <span>商品名</span><span>数量</span><span>单价</span><span>折扣</span><span>折扣率</span><span>小计</span><span>操作</span>
            </div>

            <!-- 行 -->
            <div
              v-for="(item, index) in (arrayField.value as Record<string, unknown>[])"
              :key="index"
              style="display: grid; grid-template-columns: 2fr 100px 120px 70px 100px 100px 180px; gap: 8px; align-items: center; padding: 10px 0; border-bottom: 1px solid #fafafa; font-size: 13px;"
            >
              <AInput
                size="small"
                :value="(item.name as string)"
                placeholder="商品名"
                @update:value="arrayField.replace(index, { ...item, name: $event })"
              />
              <AInputNumber
                size="small"
                :value="(item.quantity as number)"
                :min="1"
                style="width: 100%;" @update:value="arrayField.replace(index, { ...item, quantity: $event ?? 1 })"
              />
              <AInputNumber
                size="small"
                :value="(item.price as number)"
                :min="0"
                :step="0.1" :precision="2" style="width: 100%;" @update:value="arrayField.replace(index, { ...item, price: $event ?? 0 })"
              />
              <ASwitch
                :checked="!!item.discount"
                @update:checked="arrayField.replace(index, { ...item, discount: $event, discountRate: 0 })"
              />
              <!-- 条件显示：勾选折扣才显示折扣率 -->
              <AInputNumber
                v-if="item.discount"
                size="small"
                :value="(item.discountRate as number)"
                :min="0"
                :max="100" style="width: 100%;" @update:value="arrayField.replace(index, { ...item, discountRate: $event ?? 0 })"
              />
              <span v-else style="color: rgba(0,0,0,0.25); text-align: center;">—</span>
              <!-- 小计 -->
              <span style="font-weight: 600; color: #1677ff;">¥{{ getSubtotal(item) }}</span>
              <!-- 操作 -->
              <div style="display: flex; gap: 4px;">
                <AButton size="small" :disabled="!arrayField.canAdd" @click="arrayField.duplicate(index)">
                  复制
                </AButton>
                <AButton size="small" :disabled="index === 0" @click="arrayField.moveUp(index)">
                  ↑
                </AButton>
                <AButton size="small" :disabled="index === (arrayField.value as unknown[]).length - 1" @click="arrayField.moveDown(index)">
                  ↓
                </AButton>
                <AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(index)">
                  删除
                </AButton>
              </div>
            </div>

            <!-- 汇总 -->
            <div style="text-align: right; padding: 16px 0 4px; font-size: 18px; font-weight: 700; color: #ff4d4f;">
              总金额: ¥{{ getTotal() }}
            </div>
          </ACard>
        </FormArrayField>

        <AButton type="primary" html-type="submit">
          提交订单
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
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Switch as ASwitch, Tag as ATag } from 'ant-design-vue'
/**
 * Ant Design Vue 纯配置模式 - 数组字段
 *
 * 覆盖场景：
 * - 基础增删（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大/最小数量限制
 * - 项内联动（数量 × 单价 = 小计）
 * - 数组级汇总（总金额）
 */
import { ref } from 'vue'

setupAntdVue()

const form = useCreateForm({
  initialValues: {
    orderName: '',
    items: [
      { name: '商品A', quantity: 2, price: 99.9, discount: false, discountRate: 0 },
    ],
  },
})

/* 订单名 */
form.createField({ name: 'orderName', label: '订单名称', required: true })

/* 数组字段 */
form.createArrayField({
  name: 'items',
  label: '订单项',
  minItems: 1,
  maxItems: 10,
  itemTemplate: () => ({ name: '', quantity: 1, price: 0, discount: false, discountRate: 0 }),
})

const submitResult = ref('')

async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.errors.length > 0) {
    submitResult.value = `验证失败: ${result.errors.map(e => e.message).join(', ')}`
  }
  else {
    submitResult.value = JSON.stringify(result.values, null, 2)
  }
}

/** 计算小计 */
function getSubtotal(item: Record<string, unknown>): number {
  const qty = Number(item.quantity) || 0
  const price = Number(item.price) || 0
  const discount = item.discount ? (Number(item.discountRate) || 0) / 100 : 0
  return Math.round(qty * price * (1 - discount) * 100) / 100
}

/** 计算总金额 */
function getTotal(): number {
  const items = (form.values.items ?? []) as Record<string, unknown>[]
  return Math.round(items.reduce((sum, item) => sum + getSubtotal(item), 0) * 100) / 100
}
</script>
