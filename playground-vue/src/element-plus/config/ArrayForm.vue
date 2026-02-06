<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Element Plus 纯配置 - 数组字段
    </h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      增删改 / 排序 / 复制 / 最大10项最小1项 / 项内联动（勾选折扣显示折扣率）/ 汇总金额
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <!-- 订单名 -->
        <FormField v-slot="{ field }" name="orderName">
          <el-form-item :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
            <ElInput
              :model-value="(field.value as string)"
              placeholder="请输入订单名称"
              @update:model-value="field.setValue($event)"
            />
          </el-form-item>
        </FormField>

        <!-- 数组字段 -->
        <FormArrayField v-slot="{ field: arrayField }" name="items">
          <ElCard shadow="never" style="margin-bottom: 20px;">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">
                  订单项
                  <ElTag size="small" style="margin-left: 8px;">
                    {{ (arrayField.value as unknown[])?.length ?? 0 }} / 10
                  </ElTag>
                </span>
                <ElButton type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push()">
                  + 添加
                </ElButton>
              </div>
            </template>

            <!-- 表头 -->
            <div style="display: grid; grid-template-columns: 2fr 100px 120px 70px 100px 100px 160px; gap: 8px; font-size: 13px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #ebeef5; color: #606266;">
              <span>商品名</span><span>数量</span><span>单价</span><span>折扣</span><span>折扣率</span><span>小计</span><span>操作</span>
            </div>

            <!-- 行 -->
            <div
              v-for="(item, index) in (arrayField.value as Record<string, unknown>[])"
              :key="index"
              style="display: grid; grid-template-columns: 2fr 100px 120px 70px 100px 100px 160px; gap: 8px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px;"
            >
              <ElInput
                size="small"
                :model-value="(item.name as string)"
                placeholder="商品名"
                @update:model-value="arrayField.replace(index, { ...item, name: $event })"
              />
              <ElInputNumber
                size="small"
                :model-value="(item.quantity as number)"
                :min="1"
                controls-position="right" @update:model-value="arrayField.replace(index, { ...item, quantity: $event ?? 1 })"
              />
              <ElInputNumber
                size="small"
                :model-value="(item.price as number)"
                :min="0"
                :step="0.1" :precision="2" controls-position="right" @update:model-value="arrayField.replace(index, { ...item, price: $event ?? 0 })"
              />
              <ElSwitch
                :model-value="!!item.discount"
                @update:model-value="arrayField.replace(index, { ...item, discount: $event, discountRate: 0 })"
              />
              <!-- 条件显示：勾选折扣才显示折扣率 -->
              <ElInputNumber
                v-if="item.discount"
                size="small"
                :model-value="(item.discountRate as number)"
                :min="0"
                :max="100" controls-position="right" @update:model-value="arrayField.replace(index, { ...item, discountRate: $event ?? 0 })"
              />
              <span v-else style="color: #c0c4cc; text-align: center;">—</span>
              <!-- 小计 -->
              <span style="font-weight: 600; color: #409eff;">¥{{ getSubtotal(item) }}</span>
              <!-- 操作 -->
              <div style="display: flex; gap: 4px;">
                <ElButton size="small" :disabled="!arrayField.canAdd" @click="arrayField.duplicate(index)">
                  复制
                </ElButton>
                <ElButton size="small" :disabled="index === 0" @click="arrayField.moveUp(index)">
                  ↑
                </ElButton>
                <ElButton size="small" :disabled="index === (arrayField.value as unknown[]).length - 1" @click="arrayField.moveDown(index)">
                  ↓
                </ElButton>
                <ElButton size="small" type="danger" :disabled="!arrayField.canRemove" @click="arrayField.remove(index)">
                  删除
                </ElButton>
              </div>
            </div>

            <!-- 汇总 -->
            <div style="text-align: right; padding: 16px 0 4px; font-size: 18px; font-weight: 700; color: #f56c6c;">
              总金额: ¥{{ getTotal() }}
            </div>
          </ElCard>
        </FormArrayField>

        <ElButton type="primary" native-type="submit">
          提交订单
        </ElButton>
      </form>
    </FormProvider>

    <ElCard v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElButton, ElCard, ElInput, ElInputNumber, ElSwitch, ElTag } from 'element-plus'
/**
 * Element Plus 纯配置模式 - 数组字段
 *
 * 覆盖场景：
 * - 基础增删（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大/最小数量限制
 * - 数组项模板
 * - 项内联动（数量 × 单价 = 小计）
 * - 数组级汇总（总金额）
 */
import { ref } from 'vue'
import 'element-plus/dist/index.css'

setupElementPlus()

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
