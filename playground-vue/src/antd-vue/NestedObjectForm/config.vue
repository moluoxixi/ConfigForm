<template>
  <div>
    <h2>嵌套对象</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多级嵌套结构 / void Card 分组可视化 / void 不参与数据路径
    </p>
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
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  title: '员工档案',
  name: '张三',
  age: 28,
  gender: 'male',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  emergencyName: '李女士',
  emergencyRelation: 'spouse',
  emergencyPhone: '13900139000',
  province: 'beijing',
  city: '北京',
  zipCode: '100000',
  addressDetail: '朝阳区某某街道1号',
  companyName: '科技有限公司',
  department: '研发部',
  position: '高级工程师',
  building: 'A 栋',
  floor: '12F',
  seat: 'A-12-03',
  theme: 'light',
  customColor: '',
  emailNotify: true,
  smsNotify: false,
  dnd: false,
}

/**
 * 嵌套对象 Schema
 *
 * void 节点（Card）仅用于视觉分组，不参与数据路径。
 * 例：profileCard 是 void，其子字段 name 的 dataPath 是 'name' 而非 'profileCard.name'。
 */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    profileCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '👤 个人信息' },
      properties: {
        title: { type: 'string', title: '标题', required: true },
        name: { type: 'string', title: '姓名', required: true },
        age: { type: 'number', title: '年龄', componentProps: { min: 0, max: 150, style: { width: '100%' } } },
        gender: { type: 'string', title: '性别', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
      },
    },
    contactCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '📞 联系方式' },
      properties: {
        phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
        email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
        emergencyName: { type: 'string', title: '紧急联系人' },
        emergencyRelation: { type: 'string', title: '关系', enum: [{ label: '配偶', value: 'spouse' }, { label: '父母', value: 'parent' }, { label: '朋友', value: 'friend' }] },
        emergencyPhone: { type: 'string', title: '紧急联系电话' },
      },
    },
    addressCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '📍 地址' },
      properties: {
        province: { type: 'string', title: '省份', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }] },
        city: { type: 'string', title: '城市' },
        zipCode: { type: 'string', title: '邮编' },
        addressDetail: { type: 'string', title: '详细地址', component: 'Textarea' },
      },
    },
    companyCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '🏢 公司信息' },
      properties: {
        companyName: { type: 'string', title: '公司名称' },
        department: { type: 'string', title: '部门' },
        position: { type: 'string', title: '职位' },
        building: { type: 'string', title: '楼栋' },
        floor: { type: 'string', title: '楼层' },
        seat: { type: 'string', title: '工位号' },
      },
    },
    settingsCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '⚙️ 偏好设置' },
      properties: {
        theme: { type: 'string', title: '主题', component: 'RadioGroup', default: 'light', enum: [{ label: '亮色', value: 'light' }, { label: '暗色', value: 'dark' }, { label: '自定义', value: 'custom' }] },
        customColor: { type: 'string', title: '自定义颜色', visible: false, reactions: [{ watch: 'theme', when: (v: unknown[]) => v[0] === 'custom', fulfill: { state: { visible: true, required: true } }, otherwise: { state: { visible: false, required: false } } }] },
        emailNotify: { type: 'boolean', title: '邮件通知' },
        smsNotify: { type: 'boolean', title: '短信通知' },
        dnd: { type: 'boolean', title: '免打扰' },
      },
    },
  },
}
</script>
