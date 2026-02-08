<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      原生穿梭框 / 权限分配 / 搜索过滤
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="roleName">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
              <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
            </label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <div style="margin-bottom: 18px">
          <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">权限分配</label>
          <!-- 阅读态：标签展示 -->
          <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px">
            <span v-for="k in targetKeys" :key="k" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff">
              {{ PERMISSIONS.find(p => p.key === k)?.label ?? k }}
            </span>
          </div>
          <!-- 编辑/禁用态：穿梭框 -->
          <div v-else style="display: flex; gap: 12px; align-items: flex-start">
            <!-- 左侧：可选列表 -->
            <div style="flex: 1; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden">
              <div style="padding: 8px 12px; background: #f5f7fa; font-weight: 600; font-size: 13px; border-bottom: 1px solid #dcdfe6">可选权限</div>
              <div style="padding: 8px">
                <input v-model="transferSearch" placeholder="搜索权限..." style="width: 100%; padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px; box-sizing: border-box; margin-bottom: 8px" />
              </div>
              <div style="max-height: 280px; overflow: auto; padding: 0 8px 8px">
                <label v-for="item in availableItems" :key="item.key" style="display: flex; align-items: center; gap: 6px; padding: 4px 0; cursor: pointer; font-size: 13px">
                  <input type="checkbox" :checked="selectedLeft.includes(item.key)" :disabled="mode === 'disabled'" @change="toggleLeft(item.key)" />
                  {{ item.label }}
                </label>
              </div>
            </div>
            <!-- 中间：操作按钮 -->
            <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 60px">
              <button type="button" :disabled="selectedLeft.length === 0 || mode === 'disabled'" style="padding: 6px 16px; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 12px; background: #fff" @click="moveRight">
                添加 →
              </button>
              <button type="button" :disabled="selectedRight.length === 0 || mode === 'disabled'" style="padding: 6px 16px; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 12px; background: #fff" @click="moveLeft">
                ← 移除
              </button>
            </div>
            <!-- 右侧：已选列表 -->
            <div style="flex: 1; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden">
              <div style="padding: 8px 12px; background: #f5f7fa; font-weight: 600; font-size: 13px; border-bottom: 1px solid #dcdfe6">已选权限</div>
              <div style="max-height: 320px; overflow: auto; padding: 8px">
                <label v-for="item in selectedItems" :key="item.key" style="display: flex; align-items: center; gap: 6px; padding: 4px 0; cursor: pointer; font-size: 13px">
                  <input type="checkbox" :checked="selectedRight.includes(item.key)" :disabled="mode === 'disabled'" @change="toggleRight(item.key)" />
                  {{ item.label }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
      </form>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { computed, onMounted, ref, watch } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, label: `权限${String(i + 1).padStart(2, '0')} - ${['查看', '编辑', '删除', '审核', '导出'][i % 5]}${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}` }))
const targetKeys = ref(['perm-1', 'perm-3', 'perm-5'])
const transferSearch = ref('')
const selectedLeft = ref<string[]>([])
const selectedRight = ref<string[]>([])
/** 可选列表（未选中 + 搜索过滤） */
const availableItems = computed(() => {
  const available = PERMISSIONS.filter(p => !targetKeys.value.includes(p.key))
  if (transferSearch.value) {
    return available.filter(p => p.label.includes(transferSearch.value))
  }
  return available
})
/** 已选列表 */
const selectedItems = computed(() => PERMISSIONS.filter(p => targetKeys.value.includes(p.key)))
/** 切换左侧选中 */
function toggleLeft(key: string): void {
  const idx = selectedLeft.value.indexOf(key)
  if (idx >= 0) selectedLeft.value.splice(idx, 1)
  else selectedLeft.value.push(key)
}
/** 切换右侧选中 */
function toggleRight(key: string): void {
  const idx = selectedRight.value.indexOf(key)
  if (idx >= 0) selectedRight.value.splice(idx, 1)
  else selectedRight.value.push(key)
}
/** 移入已选 */
function moveRight(): void {
  targetKeys.value = [...targetKeys.value, ...selectedLeft.value]
  selectedLeft.value = []
}
/** 移出已选 */
function moveLeft(): void {
  targetKeys.value = targetKeys.value.filter(k => !selectedRight.value.includes(k))
  selectedRight.value = []
}
const form = useCreateForm({ initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] } })
onMounted(() => {
  form.createField({ name: 'roleName', label: '角色名称', required: true })
  form.createField({ name: 'permissions', label: '权限', required: true })
  watch(targetKeys, (keys) => {
    form.setFieldValue('permissions', keys)
  })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
