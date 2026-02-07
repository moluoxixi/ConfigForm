<template>
  <div>
    <h2>分页搜索数据源</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      大数据量远程搜索 / 分页加载 / 搜索防抖
    </p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="userId">
          <el-form-item label="选择用户" :required="field.required">
            <el-select :model-value="(field.value as string)" filterable :filter-method="handleSearch" :loading="loading" :disabled="mode === 'disabled'" style="width: 400px" placeholder="输入关键词搜索（共 1000 条模拟数据）" @change="(v: string) => field.setValue(v)">
              <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </FormField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">
          提交
        </el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const options = ref<Array<{ label: string, value: string }>>([])
const loading = ref(false)

const MOCK = Array.from({ length: 1000 }, (_, i) => ({ id: `user-${i + 1}`, name: `用户${String(i + 1).padStart(4, '0')}`, dept: ['技术', '产品', '设计', '运营'][i % 4] }))

const form = useCreateForm({ initialValues: { userId: undefined } })
onMounted(() => {
  form.createField({ name: 'userId', label: '选择用户', required: true })
  loadData('')
})

let timer: ReturnType<typeof setTimeout> | null = null
function handleSearch(kw: string): void {
  if (timer)
    clearTimeout(timer)
  timer = setTimeout(() => loadData(kw), 300)
}
async function loadData(kw: string): Promise<void> {
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  const filtered = kw ? MOCK.filter(u => u.name.includes(kw) || u.dept.includes(kw)) : MOCK
  options.value = filtered.slice(0, 50).map(u => ({ label: `${u.name}（${u.dept}）`, value: u.id }))
  loading.value = false
}

async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    result.value = `验证失败: ${res.errors.map(e => e.message).join(', ')}`
  }
  else {
    result.value = JSON.stringify(res.values, null, 2)
  }
}
</script>
