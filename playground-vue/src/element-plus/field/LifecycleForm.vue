<script setup lang="ts">
/**
 * Element Plus Field 组件模式 - 生命周期
 *
 * 覆盖场景：
 * - 表单初始化/挂载
 * - 值变化事件（全量 + 单字段）
 * - 提交（含验证通过/失败回调）
 * - 重置
 * - 字段聚焦/失焦
 * - 表单脏检测（离开提示）
 * - 自动保存（LocalStorage + 防抖）
 */
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import {
  ElInput, ElSelect, ElOption, ElSwitch, ElButton, ElFormItem,
  ElCard, ElTag, ElAlert, ElMessage,
} from 'element-plus';
import 'element-plus/dist/index.css';

setupElementPlus();

/** 自动保存存储 Key */
const STORAGE_KEY = 'configform_ep_autosave_demo';

/** 尝试从 LocalStorage 恢复数据 */
function loadSavedValues(): Record<string, unknown> | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* 忽略解析错误 */
  }
  return undefined;
}

const savedValues = loadSavedValues();
const wasRestored = ref(!!savedValues);

const form = useCreateForm({
  initialValues: savedValues ?? {
    title: '',
    content: '',
    category: 'tech',
    published: false,
  },
});

form.createField({ name: 'title', label: '标题', required: true, rules: [{ minLength: 2, message: '标题至少 2 个字符' }] });
form.createField({ name: 'content', label: '内容', required: true });
form.createField({
  name: 'category', label: '分类',
  dataSource: [
    { label: '技术', value: 'tech' },
    { label: '生活', value: 'life' },
    { label: '随笔', value: 'essay' },
  ],
});
form.createField({ name: 'published', label: '立即发布' });

/* 事件日志 */
const eventLog = ref<string[]>([]);
function log(msg: string): void {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift(`[${time}] ${msg}`);
  if (eventLog.value.length > 30) eventLog.value.pop();
}

/* 监听全局值变化 */
form.onValuesChange(() => {
  log('onValuesChange 触发');
});

/* 监听单字段变化 */
form.onFieldValueChange('title', (value) => {
  log(`title 值变化: "${value}"`);
});

/* 自动保存（防抖 1.5s） */
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const lastSaved = ref('');

form.onValuesChange((values) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      lastSaved.value = new Date().toLocaleTimeString();
      log('自动保存到 LocalStorage');
    } catch {
      /* 忽略写入错误 */
    }
  }, 1500);
});

/* 离开页面前提示 */
function handleBeforeUnload(e: BeforeUnloadEvent): void {
  if (form.modified) {
    e.preventDefault();
    e.returnValue = '';
  }
}
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  log('表单已挂载');
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (saveTimer) clearTimeout(saveTimer);
});

const isDirty = computed(() => form.modified);
const submitResult = ref('');

async function handleSubmit(): Promise<void> {
  log('提交开始...');
  const result = await form.submit();
  if (result.errors.length > 0) {
    log(`提交失败: ${result.errors.map((e) => e.message).join(', ')}`);
    submitResult.value = '验证失败';
    ElMessage.error('表单验证失败，请检查输入');
  } else {
    log('提交成功');
    submitResult.value = JSON.stringify(result.values, null, 2);
    localStorage.removeItem(STORAGE_KEY);
    lastSaved.value = '';
    ElMessage.success('提交成功！');
  }
}

function handleReset(): void {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  lastSaved.value = '';
  wasRestored.value = false;
  log('表单已重置');
  ElMessage.info('表单已重置');
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus Field 组件 - 生命周期</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      值变化监听 / 单字段监听 / 自动保存 LocalStorage / 脏检测 / 离开提示 / 事件日志
    </p>

    <!-- 状态栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      <ElTag :type="isDirty ? 'warning' : 'success'" effect="light">
        {{ isDirty ? '未保存' : '无修改' }}
      </ElTag>
      <ElTag v-if="lastSaved" type="info" effect="light">
        上次自动保存: {{ lastSaved }}
      </ElTag>
      <ElTag v-if="wasRestored" type="warning" effect="light">
        已从本地恢复数据
      </ElTag>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px;">
      <!-- 表单 -->
      <div>
        <FormProvider :form="form">
          <form @submit.prevent="handleSubmit">
            <FormField name="title" v-slot="{ field }">
              <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
                <ElInput
                  :model-value="(field.value as string)"
                  @update:model-value="field.setValue($event)"
                  @focus="field.focus(); log('title 聚焦')"
                  @blur="field.blur(); field.validate('blur'); log('title 失焦')"
                  placeholder="请输入标题"
                >
                  <template v-if="field.active" #suffix>
                    <ElTag size="small" type="primary" effect="plain">聚焦中</ElTag>
                  </template>
                </ElInput>
              </ElFormItem>
            </FormField>

            <FormField name="content" v-slot="{ field }">
              <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
                <ElInput
                  type="textarea" :rows="4"
                  :model-value="(field.value as string)"
                  @update:model-value="field.setValue($event)"
                  @focus="field.focus()"
                  @blur="field.blur(); field.validate('blur')"
                  placeholder="请输入内容..."
                />
              </ElFormItem>
            </FormField>

            <FormField name="category" v-slot="{ field }">
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

            <FormField name="published" v-slot="{ field }">
              <ElFormItem :label="field.label">
                <ElSwitch
                  :model-value="!!field.value"
                  @update:model-value="field.setValue($event)"
                  active-text="发布" inactive-text="草稿"
                />
              </ElFormItem>
            </FormField>

            <div style="display: flex; gap: 12px;">
              <ElButton type="primary" native-type="submit">提交</ElButton>
              <ElButton @click="handleReset">重置 + 清除存储</ElButton>
            </div>
          </form>
        </FormProvider>

        <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
          <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
        </el-card>
      </div>

      <!-- 事件日志 -->
      <el-card shadow="never" style="height: fit-content;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>事件日志</strong>
            <ElButton size="small" text @click="eventLog = []">清空</ElButton>
          </div>
        </template>
        <div style="font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; color: #606266;">
          <div v-for="(entry, i) in eventLog" :key="i" style="padding: 3px 0; border-bottom: 1px solid #f5f5f5; line-height: 1.6;">
            {{ entry }}
          </div>
          <div v-if="eventLog.length === 0" style="color: #c0c4cc; text-align: center; padding: 20px 0;">
            等待事件...
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
