<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Transfer / 权限分配 / 搜索过滤 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 穿梭框 — Config 模式
 *
 * 自定义 TransferPicker 组件注册后，在 schema 中通过 component: 'TransferPicker' 引用。
 */
import { Tag as ATag, Transfer as ATransfer } from 'ant-design-vue'
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** 权限项 */
interface PermissionItem { key: string; title: string }
const ACTIONS = ['查看', '编辑', '删除', '审核', '导出']
const RESOURCES = ['用户', '订单', '商品', '报表']
const PERMISSIONS: PermissionItem[] = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, title: `权限${String(i + 1).padStart(2, '0')} - ${ACTIONS[i % 5]}${RESOURCES[Math.floor(i / 5)]}` }))

/** 穿梭框选择器组件 */
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
      if (props.readOnly) {
        if (selected.length === 0) return h('span', { style: { color: '#999' } }, '—')
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } }, selected.map(k => { const item = props.dataSource.find(p => p.key === k); return h(ATag, { color: 'blue', key: k }, () => item?.title ?? k) }))
      }
      return h(ATransfer, { dataSource: props.dataSource, targetKeys: selected, render: (item: PermissionItem) => item.title, showSearch: true, listStyle: { width: '320px', height: '340px' }, titles: ['可选权限', '已选权限'], disabled: props.disabled, filterOption: (input: string, item: PermissionItem) => item.title.includes(input), onChange: (keys: string[]) => props.onChange?.(keys) })
    }
  },
})

registerComponent('TransferPicker', TransferPicker, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    roleName: { type: 'string', title: '角色名称', required: true, componentProps: { placeholder: '请输入角色名称', style: 'width: 300px' } },
    permissions: { type: 'string', title: '权限分配', required: true, component: 'TransferPicker', componentProps: { dataSource: PERMISSIONS } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
