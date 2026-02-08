<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      原生树形选择 / 单选+多选 / 组织树结构
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
        <FormField v-slot="{ field }" name="memberName">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="department">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <span v-if="mode === 'readOnly'" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff">
              {{ field.value ?? '—' }}
            </span>
            <select v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; background: #fff" @change="field.setValue(($event.target as HTMLSelectElement).value)">
              <option value="" disabled>请选择部门</option>
              <option v-for="opt in flatOptions" :key="opt.value" :value="opt.value">
                {{ '\u00A0\u00A0'.repeat(opt.depth) + opt.label }}
              </option>
            </select>
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="accessDepts">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <div v-if="mode === 'readOnly'" style="display: flex; flex-wrap: wrap; gap: 4px">
              <span v-for="v in ((field.value as string[]) ?? [])" :key="v" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8">
                {{ v }}
              </span>
            </div>
            <div v-else style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px; max-height: 200px; overflow: auto; width: 100%">
              <label v-for="opt in flatOptions" :key="opt.value" :style="{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: (opt.depth * 16) + 'px', padding: '4px 4px 4px ' + (opt.depth * 16) + 'px', cursor: mode === 'disabled' ? 'not-allowed' : 'pointer', fontSize: '13px' }">
                <input type="checkbox" :checked="((field.value as string[]) ?? []).includes(opt.value)" :disabled="mode === 'disabled'" @change="toggleDept(field, opt.value)" />
                {{ opt.label }}
              </label>
            </div>
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
interface TreeNode { label: string; value: string; children?: TreeNode[] }
const TREE: TreeNode[] = [{ label: '总公司', value: 'root', children: [{ label: '技术中心', value: 'tech', children: [{ label: '前端组', value: 'frontend' }, { label: '后端组', value: 'backend' }] }, { label: '产品中心', value: 'product', children: [{ label: '产品设计', value: 'pd' }, { label: '用户研究', value: 'ux' }] }] }]
/** 扁平化树节点（带层级缩进） */
interface FlatOption { label: string; value: string; depth: number }
function flattenTree(nodes: TreeNode[], depth = 0): FlatOption[] {
  const result: FlatOption[] = []
  for (const node of nodes) {
    result.push({ label: node.label, value: node.value, depth })
    if (node.children) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}
const flatOptions = flattenTree(TREE)
const form = useCreateForm({ initialValues: { memberName: '', department: undefined, accessDepts: [] } })
onMounted(() => {
  form.createField({ name: 'memberName', label: '成员姓名', required: true })
  form.createField({ name: 'department', label: '所属部门', required: true })
  form.createField({ name: 'accessDepts', label: '可访问部门' })
})
/** 切换多选部门 */
function toggleDept(field: FieldInstance, value: string): void {
  const current = (field.value as string[]) ?? []
  if (current.includes(value)) {
    field.setValue(current.filter((v: string) => v !== value))
  }
  else {
    field.setValue([...current, value])
  }
}
</script>
