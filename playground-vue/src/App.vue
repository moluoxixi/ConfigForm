<template>
  <div style="max-width: 1400px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif;">
    <h1 style="margin-bottom: 4px;">
      ConfigForm - Vue Playground
    </h1>
    <p style="color: #666; margin-bottom: 16px; font-size: 13px;">
      基于 @vue/reactivity 的响应式配置化表单 · {{ totalScenes }} 个场景 × 2 套 UI 库 · Config（Schema 驱动） / Field（自定义渲染）
    </p>

    <!-- UI 库切换 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 8px 16px; background: #f5f5f5; border-radius: 8px;">
      <span style="line-height: 32px; font-weight: 600; color: #333; font-size: 13px;">UI 组件库：</span>
      <button
        v-for="lib in uiLibs" :key="lib.key"
        :style="{ padding: '4px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  background: currentUI === lib.key ? lib.color : '#fff',
                  color: currentUI === lib.key ? '#fff' : '#333',
                  border: `2px solid ${currentUI === lib.key ? lib.color : '#ddd'}` }"
        @click="switchUI(lib.key)"
      >
        {{ lib.label }}
      </button>
    </div>

    <!-- 主体：左侧导航 + 右侧内容 -->
    <div style="display: flex; gap: 16px;">
      <!-- 左侧导航 -->
      <div style="width: 280px; flex-shrink: 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <!-- Config / Field Tab 切换 -->
        <div style="display: flex; border-bottom: 1px solid #eee;">
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: navMode === 'config' ? '#1677ff' : '#f5f5f5',
                      color: navMode === 'config' ? '#fff' : '#666' }"
            @click="navMode = 'config'"
          >
            Config 模式
          </button>
          <button
            :style="{ flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: navMode === 'field' ? '#52c41a' : '#f5f5f5',
                      color: navMode === 'field' ? '#fff' : '#666' }"
            @click="navMode = 'field'"
          >
            Field 模式
          </button>
        </div>

        <!-- 场景列表 -->
        <div style="max-height: calc(100vh - 220px); overflow: auto; padding: 8px;">
          <div v-for="group in sceneGroups" :key="group.title" style="margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #999; padding: 2px 4px;">
              {{ group.title }}
            </div>
            <button
              v-for="item in group.items" :key="item.key"
              :style="navBtnStyle(item.key)"
              @click="currentDemo = item.key"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fff; min-height: 400px;">
        <component :is="currentComponent" v-if="currentComponent" :key="`${currentUI}-${navMode}-${currentDemo}`" />
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          请选择场景
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

type UILib = 'antd-vue' | 'element-plus'

const currentUI = ref<UILib>('antd-vue')
const currentDemo = ref('BasicForm')
const navMode = ref<'config' | 'field'>('config')

const uiLibs = [
  { key: 'antd-vue' as UILib, label: 'Ant Design Vue', color: '#1677ff' },
  { key: 'element-plus' as UILib, label: 'Element Plus', color: '#409eff' },
]

/** 场景分组（key 直接使用文件夹名） */
const sceneGroups = [
  {
    title: '基础场景',
    items: [
      { key: 'BasicForm', label: '1. 基础表单' },
      { key: 'LayoutForm', label: '2. 表单布局' },
      { key: 'BasicValidationForm', label: '3. 必填与格式验证' },
      { key: 'DefaultValueForm', label: '4. 默认值' },
    ],
  },
  {
    title: '联动场景',
    items: [
      { key: 'VisibilityLinkageForm', label: '5. 显隐联动' },
      { key: 'ValueLinkageForm', label: '6. 值联动' },
      { key: 'PropertyLinkageForm', label: '7. 属性联动' },
      { key: 'CascadeSelectForm', label: '8. 级联选择' },
      { key: 'ComputedFieldForm', label: '9. 计算字段' },
      { key: 'ConditionalRequiredForm', label: '10. 条件必填' },
    ],
  },
  {
    title: '验证场景',
    items: [
      { key: 'CustomValidationForm', label: '11. 自定义验证' },
      { key: 'AsyncValidationForm', label: '12. 异步验证' },
      { key: 'CrossFieldValidationForm', label: '13. 跨字段验证' },
    ],
  },
  {
    title: '复杂数据',
    items: [
      { key: 'NestedObjectForm', label: '14. 嵌套对象' },
      { key: 'ArrayFieldForm', label: '15. 数组字段' },
      { key: 'EditableTableForm', label: '16. 可编辑表格' },
      { key: 'ObjectArrayNestedForm', label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '数据源',
    items: [
      { key: 'AsyncOptionsForm', label: '18. 异步选项' },
      { key: 'DependentDataSourceForm', label: '19. 依赖数据源' },
      { key: 'PaginatedSearchForm', label: '20. 分页搜索' },
    ],
  },
  {
    title: '布局分组',
    items: [
      { key: 'StepForm', label: '21. 分步表单' },
      { key: 'TabGroupForm', label: '22. 标签页分组' },
      { key: 'CollapseGroupForm', label: '23. 折叠面板' },
      { key: 'CardGroupForm', label: '24. 卡片分组' },
    ],
  },
  {
    title: '动态表单',
    items: [
      { key: 'DynamicFieldForm', label: '25. 动态增删字段' },
      { key: 'DynamicSchemaForm', label: '26. 动态 Schema' },
      { key: 'TemplateReuseForm', label: '27. 模板复用' },
    ],
  },
  {
    title: '复杂组件',
    items: [
      { key: 'RichTextForm', label: '28. 富文本编辑器' },
      { key: 'FileUploadForm', label: '29. 文件上传' },
      { key: 'MapPickerForm', label: '30. 地图选点' },
      { key: 'ColorPickerForm', label: '31. 颜色选择器' },
      { key: 'CodeEditorForm', label: '32. 代码编辑器' },
      { key: 'JsonEditorForm', label: '33. JSON 编辑器' },
      { key: 'SignaturePadForm', label: '34. 手写签名' },
      { key: 'TransferForm', label: '35. 穿梭框' },
      { key: 'TreeSelectForm', label: '36. 树形选择' },
      { key: 'MarkdownEditorForm', label: '37. Markdown' },
      { key: 'IconSelectorForm', label: '38. 图标选择器' },
      { key: 'CronEditorForm', label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '表单状态',
    items: [
      { key: 'DataTransformForm', label: '40. 数据转换' },
      { key: 'MultiFormForm', label: '41. 多表单协作' },
      { key: 'FormSnapshotForm', label: '42. 表单快照' },
      { key: 'UndoRedoForm', label: '43. 撤销重做' },
      { key: 'LifecycleForm', label: '44. 生命周期' },
    ],
  },
  {
    title: '其他能力',
    items: [
      { key: 'PermissionForm', label: '45. 字段权限' },
      { key: 'I18nForm', label: '46. 国际化' },
      { key: 'FormDiffForm', label: '47. 表单比对' },
      { key: 'PrintExportForm', label: '48. 打印导出' },
    ],
  },
  {
    title: '扩展场景',
    items: [
      { key: 'GridLayoutForm', label: '49. Grid 栅格布局' },
      { key: 'EffectsForm', label: '50. Effects 副作用' },
      { key: 'LargeFormPerf', label: '51. 大表单性能' },
      { key: 'CustomDecoratorForm', label: '52. 自定义装饰器' },
      { key: 'SchemaExpressionForm', label: '53. Schema 表达式' },
      { key: 'OneOfSchemaForm', label: '54. oneOf 联合 Schema' },
      { key: 'SSRCompatForm', label: '55. SSR 兼容性' },
      { key: 'VirtualScrollForm', label: '56. 虚拟滚动' },
    ],
  },
]

const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/* ======================== import.meta.glob 自动扫描 ======================== */

/** 使用 import.meta.glob 扫描所有 UI 库的 config/field 文件，自动构建组件映射 */
const antdConfigGlob = import.meta.glob('./antd-vue/*/config.vue')
const antdFieldGlob = import.meta.glob('./antd-vue/*/field.vue')
const epConfigGlob = import.meta.glob('./element-plus/*/config.vue')
const epFieldGlob = import.meta.glob('./element-plus/*/field.vue')

/** 从 glob 路径中提取文件夹名 */
function extractName(path: string): string {
  return path.match(/\/(\w+)\/(config|field)\.vue$/)?.[1] ?? ''
}

/** 将 glob 结果转为 { FolderName: AsyncComponent } 映射 */
function buildComponentMap(glob: Record<string, () => Promise<unknown>>): Record<string, ReturnType<typeof defineAsyncComponent>> {
  const map: Record<string, ReturnType<typeof defineAsyncComponent>> = {}
  for (const [path, loader] of Object.entries(glob)) {
    const name = extractName(path)
    if (name) {
      map[name] = defineAsyncComponent(loader as () => Promise<any>)
    }
  }
  return map
}

const asyncComponents: Record<UILib, Record<'config' | 'field', Record<string, ReturnType<typeof defineAsyncComponent>>>> = {
  'antd-vue': {
    config: buildComponentMap(antdConfigGlob),
    field: buildComponentMap(antdFieldGlob),
  },
  'element-plus': {
    config: buildComponentMap(epConfigGlob),
    field: buildComponentMap(epFieldGlob),
  },
}

/** 当前组件：按 UI 库 + 模式 + 场景文件夹名查找 */
const currentComponent = computed(() => {
  return asyncComponents[currentUI.value]?.[navMode.value]?.[currentDemo.value]
})

function switchUI(lib: UILib): void {
  currentUI.value = lib
}

function navBtnStyle(key: string): Record<string, string> {
  const active = currentDemo.value === key
  const color = currentUI.value === 'antd-vue' ? '#1677ff' : '#409eff'
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '3px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    background: active ? color : 'transparent',
    color: active ? '#fff' : '#333',
    fontWeight: active ? '600' : '400',
    marginBottom: '1px',
  }
}
</script>
