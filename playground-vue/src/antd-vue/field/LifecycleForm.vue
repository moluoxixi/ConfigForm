<script setup lang="ts">
/**
 * Ant Design Vue Field 组件模式 - 生命周期
 *
 * 覆盖场景：
 * - localStorage 自动保存（防抖 1.5s）
 * - 值变化事件（全量 + 单字段）
 * - 事件日志面板
 * - 离开提示（beforeunload）
 * - 表单脏检测
 */
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupAntdVue } from '@moluoxixi/ui-antd-vue';
import { message } from 'ant-design-vue';

setupAntdVue();

/** 自动保存存储 Key */
const STORAGE_KEY = 'configform_antd_autosave_demo';

/** 尝试从 LocalStorage 恢复数据 */
function loadSavedValues(): Record<string, unknown> | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* 忽略解析错误 */ }
  return undefined;
}

const savedValues = loadSavedValues();
const wasRestored = ref(!!savedValues);

const form = useCreateForm({
  initialValues: savedValues ?? { title: '', content: '', category: 'tech', published: false },
});

form.createField({ name: 'title', label: '标题', required: true, rules: [{ minLength: 2, message: '标题至少 2 个字符' }] });
form.createField({ name: 'content', label: '内容', required: true });
form.createField({
  name: 'category', label: '分类',
  dataSource: [{ label: '技术', value: 'tech' }, { label: '生活', value: 'life' }, { label: '随笔', value: 'essay' }],
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
form.onValuesChange(() => { log('onValuesChange 触发'); });

/* 监听单字段变化 */
form.onFieldValueChange('title', (value) => { log(`title 值变化: "${value}"`); });

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
    } catch { /* 忽略写入错误 */ }
  }, 1500);
});

/* 离开页面前提示 */
function handleBeforeUnload(e: BeforeUnloadEvent): void {
  if (form.modified) { e.preventDefault(); e.returnValue = ''; }
}
onMounted(() => { window.addEventListener('beforeunload', handleBeforeUnload); log('表单已挂载'); });
onBeforeUnmount(() => { window.removeEventListener('beforeunload', handleBeforeUnload); if (saveTimer) clearTimeout(saveTimer); });

const isDirty = computed(() => form.modified);
const submitResult = ref('');

async function handleSubmit(): Promise<void> {
  log('提交开始...');
  const result = await form.submit();
  if (result.errors.length > 0) {
    log(`提交失败: ${result.errors.map((e) => e.message).join(', ')}`);
    submitResult.value = '验证失败';
    message.error('表单验证失败，请检查输入');
  } else {
    log('提交成功');
    submitResult.value = JSON.stringify(result.values, null, 2);
    localStorage.removeItem(STORAGE_KEY);
    lastSaved.value = '';
    message.success('提交成功！');
  }
}

function handleReset(): void {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  lastSaved.value = '';
  wasRestored.value = false;
  log('表单已重置');
  message.info('表单已重置');
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Ant Design Vue Field 组件 - 生命周期</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      值变化监听 / 单字段监听 / 自动保存 LocalStorage / 脏检测 / 离开提示 / 事件日志
    </p>

    <!-- 状态栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      <a-tag :color="isDirty ? 'orange' : 'green'">{{ isDirty ? '未保存' : '无修改' }}</a-tag>
      <a-tag v-if="lastSaved" color="blue">上次自动保存: {{ lastSaved }}</a-tag>
      <a-tag v-if="wasRestored" color="orange">已从本地恢复数据</a-tag>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px;">
      <!-- 表单 -->
      <div>
        <FormProvider :form="form">
          <form @submit.prevent="handleSubmit">
            <FormField name="title" v-slot="{ field }">
              <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
                <a-input :value="(field.value as string)" @update:value="field.setValue($event)"
                  @focus="field.focus(); log('title 聚焦')" @blur="field.blur(); field.validate('blur'); log('title 失焦')"
                  placeholder="请输入标题">
                  <template v-if="field.active" #suffix><a-tag color="blue" style="margin: 0;">聚焦中</a-tag></template>
                </a-input>
              </a-form-item>
            </FormField>

            <FormField name="content" v-slot="{ field }">
              <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
                <a-textarea :value="(field.value as string)" @update:value="field.setValue($event)"
                  @focus="field.focus()" @blur="field.blur(); field.validate('blur')" :rows="4" placeholder="请输入内容..." />
              </a-form-item>
            </FormField>

            <FormField name="category" v-slot="{ field }">
              <a-form-item :label="field.label">
                <a-select :value="(field.value as string)" @update:value="field.setValue($event)" style="width: 100%;"
                  :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))" />
              </a-form-item>
            </FormField>

            <FormField name="published" v-slot="{ field }">
              <a-form-item :label="field.label">
                <a-switch :checked="!!field.value" @update:checked="field.setValue($event)" checked-children="发布" un-checked-children="草稿" />
              </a-form-item>
            </FormField>

            <div style="display: flex; gap: 12px;">
              <a-button type="primary" html-type="submit">提交</a-button>
              <a-button @click="handleReset">重置 + 清除存储</a-button>
            </div>
          </form>
        </FormProvider>

        <a-card v-if="submitResult" style="margin-top: 20px;">
          <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
        </a-card>
      </div>

      <!-- 事件日志 -->
      <a-card style="height: fit-content;">
        <template #title>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>事件日志</strong>
            <a-button size="small" type="link" @click="eventLog = []">清空</a-button>
          </div>
        </template>
        <div style="font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; color: rgba(0,0,0,0.65);">
          <div v-for="(entry, i) in eventLog" :key="i" style="padding: 3px 0; border-bottom: 1px solid #fafafa; line-height: 1.6;">{{ entry }}</div>
          <div v-if="eventLog.length === 0" style="color: rgba(0,0,0,0.25); text-align: center; padding: 20px 0;">等待事件...</div>
        </div>
      </a-card>
    </div>
  </div>
</template>
