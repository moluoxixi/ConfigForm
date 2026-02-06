<template>
  <div style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">
      ConfigForm - Vue Playground
    </h1>
    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
      基于 @vue/reactivity 的响应式配置化表单 · 48 个场景 × 2 套 UI 库 · 每个场景支持编辑/只读/禁用模式切换
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; padding: 12px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs"
        :key="lib.key"
        :style="{
          padding: '6px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          background: currentUI === lib.key ? lib.color : '#fff',
          color: currentUI === lib.key ? '#fff' : '#333',
          border: `2px solid ${currentUI === lib.key ? lib.color : '#ddd'}`,
        }"
        @click="switchUI(lib.key)"
      >
        {{ lib.label }}
      </button>
    </div>

    <!-- 场景导航 -->
    <div style="max-height: 400px; overflow: auto; margin-bottom: 12px; border: 1px solid #eee; border-radius: 8px; padding: 12px;">
      <div v-for="group in demoGroups" :key="group.title" style="margin-bottom: 10px;">
        <div style="font-size: 13px; font-weight: 600; color: #666; margin-bottom: 6px;">
          {{ group.title }}
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          <button
            v-for="item in group.items"
            :key="item.key"
            :style="{
              padding: '4px 10px',
              border: `1px solid ${currentDemo === item.key ? (currentUI === 'antd-vue' ? '#1677ff' : '#409eff') : '#ddd'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              background: currentDemo === item.key ? (currentUI === 'antd-vue' ? '#1677ff' : '#409eff') : '#fff',
              color: currentDemo === item.key ? '#fff' : '#333',
              fontWeight: currentDemo === item.key ? 600 : 400,
              whiteSpace: 'nowrap',
            }"
            @click="currentDemo = item.key"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div style="border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff;">
      <component :is="currentComponent" v-if="currentComponent" :key="`${currentUI}-${currentDemo}`" />
      <div v-else style="text-align: center; color: #999; padding: 40px;">
        加载中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

type UILib = 'antd-vue' | 'element-plus'
type DemoName =
  /* config 模式（1-27） */
  | 'basic' | 'layout' | 'basic-validation' | 'default-value'
  | 'visibility-linkage' | 'value-linkage' | 'property-linkage' | 'cascade-select' | 'computed-field' | 'conditional-required'
  | 'custom-validation' | 'async-validation' | 'cross-field-validation'
  | 'nested-object' | 'array-field' | 'editable-table' | 'object-array-nested'
  | 'async-options' | 'dependent-datasource' | 'paginated-search'
  | 'step-form' | 'tab-group' | 'collapse-group' | 'card-group'
  | 'dynamic-field' | 'dynamic-schema' | 'template-reuse'
  /* field 模式（28-48） */
  | 'rich-text' | 'file-upload' | 'map-picker' | 'color-picker' | 'code-editor' | 'json-editor' | 'signature-pad'
  | 'transfer' | 'tree-select' | 'markdown-editor' | 'icon-selector' | 'cron-editor'
  | 'data-transform' | 'multi-form' | 'form-snapshot' | 'undo-redo' | 'lifecycle'
  | 'permission' | 'i18n' | 'form-diff' | 'print-export'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref<DemoName>('basic')

const uiLibs = [
  { key: 'antd-vue' as UILib, label: '🐜 Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: '🧊 Element Plus', color: '#409eff' },
]

const demoGroups = [
  {
    title: '📋 基础场景（Config 模式）',
    items: [
      { key: 'basic' as DemoName, label: '1. 基础表单' },
      { key: 'layout' as DemoName, label: '2. 表单布局' },
      { key: 'basic-validation' as DemoName, label: '3. 必填与格式验证' },
      { key: 'default-value' as DemoName, label: '4. 默认值' },
    ],
  },
  {
    title: '🔗 联动场景',
    items: [
      { key: 'visibility-linkage' as DemoName, label: '5. 显隐联动' },
      { key: 'value-linkage' as DemoName, label: '6. 值联动' },
      { key: 'property-linkage' as DemoName, label: '7. 属性联动' },
      { key: 'cascade-select' as DemoName, label: '8. 级联选择' },
      { key: 'computed-field' as DemoName, label: '9. 计算字段' },
      { key: 'conditional-required' as DemoName, label: '10. 条件必填' },
    ],
  },
  {
    title: '✅ 验证场景',
    items: [
      { key: 'custom-validation' as DemoName, label: '11. 自定义验证' },
      { key: 'async-validation' as DemoName, label: '12. 异步验证' },
      { key: 'cross-field-validation' as DemoName, label: '13. 跨字段验证' },
    ],
  },
  {
    title: '📦 复杂数据',
    items: [
      { key: 'nested-object' as DemoName, label: '14. 嵌套对象' },
      { key: 'array-field' as DemoName, label: '15. 数组字段' },
      { key: 'editable-table' as DemoName, label: '16. 可编辑表格' },
      { key: 'object-array-nested' as DemoName, label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '🌐 数据源',
    items: [
      { key: 'async-options' as DemoName, label: '18. 异步选项' },
      { key: 'dependent-datasource' as DemoName, label: '19. 依赖数据源' },
      { key: 'paginated-search' as DemoName, label: '20. 分页搜索' },
    ],
  },
  {
    title: '📐 布局分组',
    items: [
      { key: 'step-form' as DemoName, label: '21. 分步表单' },
      { key: 'tab-group' as DemoName, label: '22. 标签页分组' },
      { key: 'collapse-group' as DemoName, label: '23. 折叠面板' },
      { key: 'card-group' as DemoName, label: '24. 卡片分组' },
    ],
  },
  {
    title: '⚡ 动态表单',
    items: [
      { key: 'dynamic-field' as DemoName, label: '25. 动态增删字段' },
      { key: 'dynamic-schema' as DemoName, label: '26. 动态 Schema' },
      { key: 'template-reuse' as DemoName, label: '27. 模板复用' },
    ],
  },
  {
    title: '🧩 复杂组件（Field 模式）',
    items: [
      { key: 'rich-text' as DemoName, label: '28. 富文本编辑器' },
      { key: 'file-upload' as DemoName, label: '29. 文件上传' },
      { key: 'map-picker' as DemoName, label: '30. 地图选点' },
      { key: 'color-picker' as DemoName, label: '31. 颜色选择器' },
      { key: 'code-editor' as DemoName, label: '32. 代码编辑器' },
      { key: 'json-editor' as DemoName, label: '33. JSON 编辑器' },
      { key: 'signature-pad' as DemoName, label: '34. 手写签名' },
      { key: 'transfer' as DemoName, label: '35. 穿梭框' },
      { key: 'tree-select' as DemoName, label: '36. 树形选择' },
      { key: 'markdown-editor' as DemoName, label: '37. Markdown' },
      { key: 'icon-selector' as DemoName, label: '38. 图标选择器' },
      { key: 'cron-editor' as DemoName, label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '🔄 表单状态',
    items: [
      { key: 'data-transform' as DemoName, label: '40. 数据转换' },
      { key: 'multi-form' as DemoName, label: '41. 多表单协作' },
      { key: 'form-snapshot' as DemoName, label: '42. 表单快照' },
      { key: 'undo-redo' as DemoName, label: '43. 撤销重做' },
      { key: 'lifecycle' as DemoName, label: '44. 生命周期' },
    ],
  },
  {
    title: '🛡️ 其他能力',
    items: [
      { key: 'permission' as DemoName, label: '45. 字段权限' },
      { key: 'i18n' as DemoName, label: '46. 国际化' },
      { key: 'form-diff' as DemoName, label: '47. 表单比对' },
      { key: 'print-export' as DemoName, label: '48. 打印导出' },
    ],
  },
]

/** DemoName → 文件名映射 */
const fileMap: Record<DemoName, string> = {
  /* config 模式 */
  'basic': 'BasicForm',
  'layout': 'LayoutForm',
  'basic-validation': 'BasicValidationForm',
  'default-value': 'DefaultValueForm',
  'visibility-linkage': 'VisibilityLinkageForm',
  'value-linkage': 'ValueLinkageForm',
  'property-linkage': 'PropertyLinkageForm',
  'cascade-select': 'CascadeSelectForm',
  'computed-field': 'ComputedFieldForm',
  'conditional-required': 'ConditionalRequiredForm',
  'custom-validation': 'CustomValidationForm',
  'async-validation': 'AsyncValidationForm',
  'cross-field-validation': 'CrossFieldValidationForm',
  'nested-object': 'NestedObjectForm',
  'array-field': 'ArrayFieldForm',
  'editable-table': 'EditableTableForm',
  'object-array-nested': 'ObjectArrayNestedForm',
  'async-options': 'AsyncOptionsForm',
  'dependent-datasource': 'DependentDataSourceForm',
  'paginated-search': 'PaginatedSearchForm',
  'step-form': 'StepForm',
  'tab-group': 'TabGroupForm',
  'collapse-group': 'CollapseGroupForm',
  'card-group': 'CardGroupForm',
  'dynamic-field': 'DynamicFieldForm',
  'dynamic-schema': 'DynamicSchemaForm',
  'template-reuse': 'TemplateReuseForm',
  /* field 模式 */
  'rich-text': 'RichTextForm',
  'file-upload': 'FileUploadForm',
  'map-picker': 'MapPickerForm',
  'color-picker': 'ColorPickerForm',
  'code-editor': 'CodeEditorForm',
  'json-editor': 'JsonEditorForm',
  'signature-pad': 'SignaturePadForm',
  'transfer': 'TransferForm',
  'tree-select': 'TreeSelectForm',
  'markdown-editor': 'MarkdownEditorForm',
  'icon-selector': 'IconSelectorForm',
  'cron-editor': 'CronEditorForm',
  'data-transform': 'DataTransformForm',
  'multi-form': 'MultiFormForm',
  'form-snapshot': 'FormSnapshotForm',
  'undo-redo': 'UndoRedoForm',
  'lifecycle': 'LifecycleForm',
  'permission': 'PermissionForm',
  'i18n': 'I18nForm',
  'form-diff': 'FormDiffForm',
  'print-export': 'PrintExportForm',
}

/** 动态导入组件（自动发现） */
const asyncComponents: Record<string, Record<string, ReturnType<typeof defineAsyncComponent>>> = {
  'antd-vue': {},
  'element-plus': {},
}

/* 注册 antd-vue 所有异步组件 */
const antdConfigModules = import.meta.glob('./antd-vue/config/*.vue')
const antdFieldModules = import.meta.glob('./antd-vue/field/*.vue')
for (const [path, loader] of Object.entries({ ...antdConfigModules, ...antdFieldModules })) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['antd-vue'][name] = defineAsyncComponent(loader as () => Promise<any>)
}

/* 注册 element-plus 所有异步组件 */
const elConfigModules = import.meta.glob('./element-plus/config/*.vue')
const elFieldModules = import.meta.glob('./element-plus/field/*.vue')
for (const [path, loader] of Object.entries({ ...elConfigModules, ...elFieldModules })) {
  const name = path.match(/\/(\w+)\.vue$/)?.[1] ?? ''
  if (name) asyncComponents['element-plus'][name] = defineAsyncComponent(loader as () => Promise<any>)
}

/** 当前组件 */
const currentComponent = computed(() => {
  const fileName = fileMap[currentDemo.value]
  return asyncComponents[currentUI.value]?.[fileName]
})

function switchUI(lib: UILib): void {
  currentUI.value = lib
  currentDemo.value = 'basic'
}
</script>
