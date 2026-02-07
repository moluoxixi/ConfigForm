<template>
  <div style="max-width: 1400px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">ConfigForm - Vue Playground</h1>
    <p style="color: #666; margin-bottom: 16px; font-size: 13px;">
      基于 @vue/reactivity 的响应式配置化表单 · 48 个场景 × 2 套 UI 库 · Config（Schema 驱动） / Field（自定义渲染）
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 8px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333; font-size: 13px;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs" :key="lib.key"
        :style="{ padding: '4px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          background: currentUI === lib.key ? lib.color : '#fff', color: currentUI === lib.key ? '#fff' : '#333',
          border: `2px solid ${currentUI === lib.key ? lib.color : '#ddd'}` }"
        @click="switchUI(lib.key)"
      >{{ lib.label }}</button>
    </div>

    <!-- 主体：左侧导航 + 右侧内容 -->
    <div style="display: flex; gap: 16px;">
      <!-- 左侧导航 -->
      <div style="width: 280px; flex-shrink: 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <!-- Config / Field Tab 切换 -->
        <div style="display: flex; border-bottom: 1px solid #eee;">
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: navMode === 'config' ? '#1677ff' : '#f5f5f5', color: navMode === 'config' ? '#fff' : '#666' }"
            @click="navMode = 'config'"
          >Config 模式</button>
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: navMode === 'field' ? '#52c41a' : '#f5f5f5', color: navMode === 'field' ? '#fff' : '#666' }"
            @click="navMode = 'field'"
          >Field 模式</button>
        </div>

        <!-- 场景列表（两种模式共用同一场景列表） -->
        <div style="max-height: calc(100vh - 220px); overflow: auto; padding: 8px;">
          <div v-for="group in sceneGroups" :key="group.title" style="margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #999; padding: 2px 4px;">{{ group.title }}</div>
            <button
              v-for="item in group.items" :key="item.key"
              :style="navBtnStyle(item.key)"
              @click="currentDemo = item.key"
            >{{ item.label }}</button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; min-height: 400px;">
        <component :is="currentComponent" v-if="currentComponent" :key="`${currentUI}-${navMode}-${currentDemo}`" />
        <div v-else style="text-align: center; color: #999; padding: 40px;">请选择场景</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

type UILib = 'antd-vue' | 'element-plus'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('basic')
const navMode = ref<'config' | 'field'>('config')

const uiLibs = [
  { key: 'antd-vue' as UILib, label: '🐜 Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: '🧊 Element Plus', color: '#409eff' },
]

/** 全部 48 场景（Config 和 Field 共用） */
const sceneGroups = [
  {
    title: '基础场景',
    items: [
      { key: 'basic', label: '1. 基础表单' },
      { key: 'layout', label: '2. 表单布局' },
      { key: 'basic-validation', label: '3. 必填与格式验证' },
      { key: 'default-value', label: '4. 默认值' },
    ],
  },
  {
    title: '联动场景',
    items: [
      { key: 'visibility-linkage', label: '5. 显隐联动' },
      { key: 'value-linkage', label: '6. 值联动' },
      { key: 'property-linkage', label: '7. 属性联动' },
      { key: 'cascade-select', label: '8. 级联选择' },
      { key: 'computed-field', label: '9. 计算字段' },
      { key: 'conditional-required', label: '10. 条件必填' },
    ],
  },
  {
    title: '验证场景',
    items: [
      { key: 'custom-validation', label: '11. 自定义验证' },
      { key: 'async-validation', label: '12. 异步验证' },
      { key: 'cross-field-validation', label: '13. 跨字段验证' },
    ],
  },
  {
    title: '复杂数据',
    items: [
      { key: 'nested-object', label: '14. 嵌套对象' },
      { key: 'array-field', label: '15. 数组字段' },
      { key: 'editable-table', label: '16. 可编辑表格' },
      { key: 'object-array-nested', label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '数据源',
    items: [
      { key: 'async-options', label: '18. 异步选项' },
      { key: 'dependent-datasource', label: '19. 依赖数据源' },
      { key: 'paginated-search', label: '20. 分页搜索' },
    ],
  },
  {
    title: '布局分组',
    items: [
      { key: 'step-form', label: '21. 分步表单' },
      { key: 'tab-group', label: '22. 标签页分组' },
      { key: 'collapse-group', label: '23. 折叠面板' },
      { key: 'card-group', label: '24. 卡片分组' },
    ],
  },
  {
    title: '动态表单',
    items: [
      { key: 'dynamic-field', label: '25. 动态增删字段' },
      { key: 'dynamic-schema', label: '26. 动态 Schema' },
      { key: 'template-reuse', label: '27. 模板复用' },
    ],
  },
  {
    title: '复杂组件',
    items: [
      { key: 'rich-text', label: '28. 富文本编辑器' },
      { key: 'file-upload', label: '29. 文件上传' },
      { key: 'map-picker', label: '30. 地图选点' },
      { key: 'color-picker', label: '31. 颜色选择器' },
      { key: 'code-editor', label: '32. 代码编辑器' },
      { key: 'json-editor', label: '33. JSON 编辑器' },
      { key: 'signature-pad', label: '34. 手写签名' },
      { key: 'transfer', label: '35. 穿梭框' },
      { key: 'tree-select', label: '36. 树形选择' },
      { key: 'markdown-editor', label: '37. Markdown' },
      { key: 'icon-selector', label: '38. 图标选择器' },
      { key: 'cron-editor', label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '表单状态',
    items: [
      { key: 'data-transform', label: '40. 数据转换' },
      { key: 'multi-form', label: '41. 多表单协作' },
      { key: 'form-snapshot', label: '42. 表单快照' },
      { key: 'undo-redo', label: '43. 撤销重做' },
      { key: 'lifecycle', label: '44. 生命周期' },
    ],
  },
  {
    title: '其他能力',
    items: [
      { key: 'permission', label: '45. 字段权限' },
      { key: 'i18n', label: '46. 国际化' },
      { key: 'form-diff', label: '47. 表单比对' },
      { key: 'print-export', label: '48. 打印导出' },
    ],
  },
]

/** 场景 key → 文件名映射 */
const fileMap: Record<string, string> = {
  'basic': 'BasicForm', 'layout': 'LayoutForm', 'basic-validation': 'BasicValidationForm', 'default-value': 'DefaultValueForm',
  'visibility-linkage': 'VisibilityLinkageForm', 'value-linkage': 'ValueLinkageForm', 'property-linkage': 'PropertyLinkageForm',
  'cascade-select': 'CascadeSelectForm', 'computed-field': 'ComputedFieldForm', 'conditional-required': 'ConditionalRequiredForm',
  'custom-validation': 'CustomValidationForm', 'async-validation': 'AsyncValidationForm', 'cross-field-validation': 'CrossFieldValidationForm',
  'nested-object': 'NestedObjectForm', 'array-field': 'ArrayFieldForm', 'editable-table': 'EditableTableForm', 'object-array-nested': 'ObjectArrayNestedForm',
  'async-options': 'AsyncOptionsForm', 'dependent-datasource': 'DependentDataSourceForm', 'paginated-search': 'PaginatedSearchForm',
  'step-form': 'StepForm', 'tab-group': 'TabGroupForm', 'collapse-group': 'CollapseGroupForm', 'card-group': 'CardGroupForm',
  'dynamic-field': 'DynamicFieldForm', 'dynamic-schema': 'DynamicSchemaForm', 'template-reuse': 'TemplateReuseForm',
  'rich-text': 'RichTextForm', 'file-upload': 'FileUploadForm', 'map-picker': 'MapPickerForm', 'color-picker': 'ColorPickerForm',
  'code-editor': 'CodeEditorForm', 'json-editor': 'JsonEditorForm', 'signature-pad': 'SignaturePadForm',
  'transfer': 'TransferForm', 'tree-select': 'TreeSelectForm', 'markdown-editor': 'MarkdownEditorForm',
  'icon-selector': 'IconSelectorForm', 'cron-editor': 'CronEditorForm',
  'data-transform': 'DataTransformForm', 'multi-form': 'MultiFormForm', 'form-snapshot': 'FormSnapshotForm',
  'undo-redo': 'UndoRedoForm', 'lifecycle': 'LifecycleForm',
  'permission': 'PermissionForm', 'i18n': 'I18nForm', 'form-diff': 'FormDiffForm', 'print-export': 'PrintExportForm',
}

/**
 * 动态导入组件
 *
 * 按 UI 库 × 模式（config/field）组织：
 * antd-vue/config/*.vue + antd-vue/field/*.vue
 */
const asyncComponents: Record<string, Record<string, Record<string, ReturnType<typeof defineAsyncComponent>>>> = {
  'antd-vue': { config: {}, field: {} },
  'element-plus': { config: {}, field: {} },
}

/* antd-vue: ./antd-vue/XxxForm/config.vue + field.vue */
for (const [path, loader] of Object.entries(import.meta.glob('./antd-vue/*/config.vue'))) {
  const name = path.match(/\/antd-vue\/(\w+)\/config\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['antd-vue'].config[name] = defineAsyncComponent(loader as () => Promise<any>)
}
for (const [path, loader] of Object.entries(import.meta.glob('./antd-vue/*/field.vue'))) {
  const name = path.match(/\/antd-vue\/(\w+)\/field\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['antd-vue'].field[name] = defineAsyncComponent(loader as () => Promise<any>)
}

/* element-plus: ./element-plus/XxxForm/config.vue + field.vue */
for (const [path, loader] of Object.entries(import.meta.glob('./element-plus/*/config.vue'))) {
  const name = path.match(/\/element-plus\/(\w+)\/config\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['element-plus'].config[name] = defineAsyncComponent(loader as () => Promise<any>)
}
for (const [path, loader] of Object.entries(import.meta.glob('./element-plus/*/field.vue'))) {
  const name = path.match(/\/element-plus\/(\w+)\/field\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['element-plus'].field[name] = defineAsyncComponent(loader as () => Promise<any>)
}

/** 当前组件：按 UI 库 + 模式 + 场景名查找 */
const currentComponent = computed(() => {
  const fileName = fileMap[currentDemo.value]
  if (!fileName) return undefined
  return asyncComponents[currentUI.value]?.[navMode.value]?.[fileName]
})

function switchUI(lib: UILib): void {
  currentUI.value = lib
}

function navBtnStyle(key: string): Record<string, string> {
  const active = currentDemo.value === key
  const color = currentUI.value === 'antd-vue' ? '#1677ff' : '#409eff'
  return {
    display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
    background: active ? color : 'transparent', color: active ? '#fff' : '#333',
    fontWeight: active ? '600' : '400', marginBottom: '1px',
  }
}
</script>
