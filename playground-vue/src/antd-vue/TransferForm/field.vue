<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd Transfer / 权限分配 / 搜索过滤
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="roleName" :field-props="{ label: '角色名称', required: true, component: 'Input', componentProps: { placeholder: '请输入角色名称', style: 'width: 300px' } }" />
          <FormField name="permissions" :field-props="{ label: '权限分配', required: true, component: 'TransferPicker', componentProps: { dataSource: PERMISSIONS } }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { Tag as ATag, Transfer as ATransfer } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== 权限数据 ==========

/** 权限项类型 */
interface PermissionItem {
  key: string
  title: string
}

/** 操作标签 */
const ACTIONS = ['查看', '编辑', '删除', '审核', '导出']

/** 资源标签 */
const RESOURCES = ['用户', '订单', '商品', '报表']

/** 权限列表（20 项） */
const PERMISSIONS: PermissionItem[] = Array.from({ length: 20 }, (_, i) => ({
  key: `perm-${i + 1}`,
  title: `权限${String(i + 1).padStart(2, '0')} - ${ACTIONS[i % 5]}${RESOURCES[Math.floor(i / 5)]}`,
}))

// ========== 自定义组件：穿梭框选择器 ==========

/**
 * 穿梭框选择器组件
 *
 * - 编辑态：antd Transfer（双栏穿梭，支持搜索）
 * - 禁用态：antd Transfer（disabled）
 * - 只读态：已选权限 Tag 标签列表
 */
const TransferPicker = defineComponent({
  name: 'TransferPicker',
  props: {
    value: { type: Array as PropType<string[]>, default: () => [] },
    onChange: { type: Function as PropType<(v: string[]) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    dataSource: { type: Array as PropType<PermissionItem[]>, default: () => [] },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      const selected = props.value ?? []

      /* 只读态：Tag 标签列表 */
      if (props.readOnly) {
        if (selected.length === 0) {
          return h('span', { style: { color: '#999' } }, '—')
        }
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
          selected.map((k) => {
            const item = props.dataSource.find(p => p.key === k)
            return h(ATag, { color: 'blue', key: k }, () => item?.title ?? k)
          }),
        )
      }

      /* 编辑态 / 禁用态：antd Transfer */
      return h(ATransfer, {
        dataSource: props.dataSource,
        targetKeys: selected,
        render: (item: PermissionItem) => item.title,
        showSearch: true,
        listStyle: { width: '320px', height: '340px' },
        titles: ['可选权限', '已选权限'],
        disabled: props.disabled,
        filterOption: (input: string, item: PermissionItem) => item.title.includes(input),
        onChange: (keys: string[]) => props.onChange?.(keys),
      })
    }
  },
})

registerComponent('TransferPicker', TransferPicker, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    roleName: '管理员',
    permissions: ['perm-1', 'perm-3', 'perm-5'],
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
