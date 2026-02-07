<template>
  <div>
    <h2>嵌套对象</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多级嵌套结构 / 嵌套内联动 / 深层路径读写 / 提交还原嵌套 JSON
    </p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
        <!-- ───── 顶层字段 ───── -->
        <AFormItem label="标题" required>
          <FormField v-slot="{ field }" name="title">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
            <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="请输入标题" :disabled="mode === 'disabled'" style="width: 360px" />
          </FormField>
        </AFormItem>

        <!-- ───── 1层嵌套：个人信息 ───── -->
        <ACard title="👤 个人信息 (profile)" size="small" style="margin-bottom: 16px">
          <ARow :gutter="16">
            <ACol :span="8">
              <AFormItem label="姓名" required>
                <FormField v-slot="{ field }" name="profile.name">
                  <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                  <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="请输入" :disabled="mode === 'disabled'" />
                </FormField>
              </AFormItem>
            </ACol>
            <ACol :span="8">
              <AFormItem label="年龄">
                <FormField v-slot="{ field }" name="profile.age">
                  <span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span>
                  <AInputNumber v-else :value="(field.value as number)" @update:value="field.setValue($event)" :min="0" :max="150" :disabled="mode === 'disabled'" style="width: 100%" />
                </FormField>
              </AFormItem>
            </ACol>
            <ACol :span="8">
              <AFormItem label="性别">
                <FormField v-slot="{ field }" name="profile.gender">
                  <span v-if="mode === 'readOnly'">{{ genderLabel(field.value as string) }}</span>
                  <ASelect v-else :value="(field.value as string)" @update:value="field.setValue($event)" :options="genderOptions" placeholder="请选择" :disabled="mode === 'disabled'" style="width: 100%" />
                </FormField>
              </AFormItem>
            </ACol>
          </ARow>

          <!-- ───── 2层嵌套：联系方式 ───── -->
          <ACard title="📞 联系方式 (profile.contact)" size="small" type="inner" style="margin-bottom: 12px">
            <ARow :gutter="16">
              <ACol :span="12">
                <AFormItem label="手机号">
                  <FormField v-slot="{ field }" name="profile.contact.phone">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="13800138000" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="12">
                <AFormItem label="邮箱">
                  <FormField v-slot="{ field }" name="profile.contact.email">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="user@example.com" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
            </ARow>

            <!-- ───── 3层嵌套：紧急联系人 ───── -->
            <ACard title="🆘 紧急联系人 (profile.contact.emergency)" size="small" type="inner" :body-style="{ background: '#fafafa' }">
              <ARow :gutter="16">
                <ACol :span="8">
                  <AFormItem label="姓名">
                    <FormField v-slot="{ field }" name="profile.contact.emergency.name">
                      <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                      <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="紧急联系人" :disabled="mode === 'disabled'" />
                    </FormField>
                  </AFormItem>
                </ACol>
                <ACol :span="8">
                  <AFormItem label="关系">
                    <FormField v-slot="{ field }" name="profile.contact.emergency.relation">
                      <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                      <ASelect v-else :value="(field.value as string)" @update:value="field.setValue($event)" :options="relationOptions" placeholder="请选择" :disabled="mode === 'disabled'" style="width: 100%" />
                    </FormField>
                  </AFormItem>
                </ACol>
                <ACol :span="8">
                  <AFormItem label="电话">
                    <FormField v-slot="{ field }" name="profile.contact.emergency.phone">
                      <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                      <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="紧急联系电话" :disabled="mode === 'disabled'" />
                    </FormField>
                  </AFormItem>
                </ACol>
              </ARow>
            </ACard>
          </ACard>

          <!-- ───── 2层嵌套：地址 ───── -->
          <ACard title="📍 地址 (profile.address)" size="small" type="inner">
            <ARow :gutter="16">
              <ACol :span="8">
                <AFormItem label="省份">
                  <FormField v-slot="{ field }" name="profile.address.province">
                    <span v-if="mode === 'readOnly'">{{ provinceLabel(field.value as string) }}</span>
                    <ASelect v-else :value="(field.value as string)" @update:value="field.setValue($event)" :options="provinceOptions" placeholder="请选择" :disabled="mode === 'disabled'" style="width: 100%" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="城市">
                  <FormField v-slot="{ field }" name="profile.address.city">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="请输入城市" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="邮编">
                  <FormField v-slot="{ field }" name="profile.address.zipCode">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="100000" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
            </ARow>
            <AFormItem label="详细地址">
              <FormField v-slot="{ field }" name="profile.address.detail">
                <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                <ATextarea v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="街道、门牌号" :rows="2" :disabled="mode === 'disabled'" />
              </FormField>
            </AFormItem>
          </ACard>
        </ACard>

        <!-- ───── 1层嵌套：公司信息 ───── -->
        <ACard title="🏢 公司信息 (company)" size="small" style="margin-bottom: 16px">
          <ARow :gutter="16">
            <ACol :span="8">
              <AFormItem label="公司名称">
                <FormField v-slot="{ field }" name="company.name">
                  <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                  <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="公司名称" :disabled="mode === 'disabled'" />
                </FormField>
              </AFormItem>
            </ACol>
            <ACol :span="8">
              <AFormItem label="部门">
                <FormField v-slot="{ field }" name="company.department">
                  <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                  <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="部门" :disabled="mode === 'disabled'" />
                </FormField>
              </AFormItem>
            </ACol>
            <ACol :span="8">
              <AFormItem label="职位">
                <FormField v-slot="{ field }" name="company.position">
                  <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                  <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="职位" :disabled="mode === 'disabled'" />
                </FormField>
              </AFormItem>
            </ACol>
          </ARow>

          <!-- ───── 2层嵌套：公司地址 ───── -->
          <ACard title="🏠 办公地址 (company.office)" size="small" type="inner">
            <ARow :gutter="16">
              <ACol :span="8">
                <AFormItem label="楼栋">
                  <FormField v-slot="{ field }" name="company.office.building">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="A 栋" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="楼层">
                  <FormField v-slot="{ field }" name="company.office.floor">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="12F" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="工位号">
                  <FormField v-slot="{ field }" name="company.office.seat">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="A-12-03" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
            </ARow>
          </ACard>
        </ACard>

        <!-- ───── 1层嵌套：设置（含联动） ───── -->
        <ACard title="⚙️ 偏好设置 (settings)" size="small" style="margin-bottom: 16px">
          <ARow :gutter="16">
            <ACol :span="12">
              <AFormItem label="主题">
                <FormField v-slot="{ field }" name="settings.theme">
                  <span v-if="mode === 'readOnly'">{{ themeLabel(field.value as string) }}</span>
                  <ARadioGroup v-else :value="(field.value as string)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'">
                    <ARadioButton value="light">亮色</ARadioButton>
                    <ARadioButton value="dark">暗色</ARadioButton>
                    <ARadioButton value="custom">自定义</ARadioButton>
                  </ARadioGroup>
                </FormField>
              </AFormItem>
            </ACol>
            <ACol :span="12">
              <!-- 联动：仅当 theme === 'custom' 时显示 -->
              <AFormItem v-if="showCustomColor" label="自定义颜色" required>
                <FormField v-slot="{ field }" name="settings.customColor">
                  <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                  <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="#1677ff" :disabled="mode === 'disabled'" />
                </FormField>
              </AFormItem>
            </ACol>
          </ARow>

          <!-- ───── 2层嵌套：通知设置 ───── -->
          <ACard title="🔔 通知偏好 (settings.notifications)" size="small" type="inner">
            <ARow :gutter="16">
              <ACol :span="8">
                <AFormItem label="邮件通知">
                  <FormField v-slot="{ field }" name="settings.notifications.email">
                    <ASwitch :checked="!!field.value" @update:checked="field.setValue($event)" :disabled="mode !== 'editable'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="短信通知">
                  <FormField v-slot="{ field }" name="settings.notifications.sms">
                    <ASwitch :checked="!!field.value" @update:checked="field.setValue($event)" :disabled="mode !== 'editable'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="8">
                <AFormItem label="免打扰">
                  <FormField v-slot="{ field }" name="settings.notifications.dnd">
                    <ASwitch :checked="!!field.value" @update:checked="field.setValue($event)" :disabled="mode !== 'editable'" />
                  </FormField>
                </AFormItem>
              </ACol>
            </ARow>
            <!-- 联动：仅当"免打扰"开启时显示 -->
            <ARow v-if="showDndSchedule" :gutter="16">
              <ACol :span="12">
                <AFormItem label="免打扰开始">
                  <FormField v-slot="{ field }" name="settings.notifications.dndStart">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="22:00" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
              <ACol :span="12">
                <AFormItem label="免打扰结束">
                  <FormField v-slot="{ field }" name="settings.notifications.dndEnd">
                    <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span>
                    <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="08:00" :disabled="mode === 'disabled'" />
                  </FormField>
                </AFormItem>
              </ACol>
            </ARow>
          </ACard>
        </ACard>

        <!-- 提交数据结构预览 -->
        <ACard size="small" style="margin-bottom: 16px; background: #f9f9f9">
          <template #title>
            <span style="font-size: 13px; color: #666">📋 嵌套路径一览（{{ fieldPaths.length }} 个字段，最深 4 层）</span>
          </template>
          <div style="font-family: monospace; font-size: 12px; line-height: 1.8; color: #555">
            <div v-for="p in fieldPaths" :key="p" :style="{ paddingLeft: `${(p.split('.').length - 1) * 16}px` }">
              <span style="color: #1677ff">{{ p.split('.').pop() }}</span>
              <span style="color: #aaa"> — {{ p }}</span>
            </div>
          </div>
        </ACard>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import {
  Card as ACard,
  Col as ACol,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Radio as ARadio,
  Row as ARow,
  Select as ASelect,
  Switch as ASwitch,
  Textarea as ATextarea,
} from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

const ARadioGroup = ARadio.Group
const ARadioButton = ARadio.Button

setupAntdVue()

/* ---------- 初始数据（4 层嵌套） ---------- */
const initialValues = {
  title: '员工档案',
  profile: {
    name: '张三',
    age: 28,
    gender: 'male',
    contact: {
      phone: '13800138000',
      email: 'zhangsan@example.com',
      emergency: { name: '李女士', relation: 'spouse', phone: '13900139000' },
    },
    address: { province: 'beijing', city: '北京', zipCode: '100000', detail: '朝阳区某某街道1号' },
  },
  company: {
    name: '科技有限公司',
    department: '研发部',
    position: '高级工程师',
    office: { building: 'A 栋', floor: '12F', seat: 'A-12-03' },
  },
  settings: {
    theme: 'light',
    customColor: '',
    notifications: { email: true, sms: false, dnd: false, dndStart: '22:00', dndEnd: '08:00' },
  },
}

const form = useCreateForm({ initialValues })

/* 创建需要校验的字段 */
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'profile.name', label: '姓名', required: true })
})

/* ---------- 选项 ---------- */
const genderOptions = [{ label: '男', value: 'male' }, { label: '女', value: 'female' }]
const provinceOptions = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }]
const relationOptions = [{ label: '配偶', value: 'spouse' }, { label: '父母', value: 'parent' }, { label: '朋友', value: 'friend' }]

/* ---------- 标签映射 ---------- */
function genderLabel(v: string): string { return genderOptions.find(o => o.value === v)?.label ?? '—' }
function provinceLabel(v: string): string { return provinceOptions.find(o => o.value === v)?.label ?? '—' }
function themeLabel(v: string): string { return ({ light: '亮色', dark: '暗色', custom: '自定义' }[v]) ?? '—' }

/* ---------- 联动计算 ---------- */
const showCustomColor = computed(() => form.values.settings?.theme === 'custom')
const showDndSchedule = computed(() => form.values.settings?.notifications?.dnd === true)

/* ---------- 字段路径一览 ---------- */
const fieldPaths = [
  'title',
  'profile.name', 'profile.age', 'profile.gender',
  'profile.contact.phone', 'profile.contact.email',
  'profile.contact.emergency.name', 'profile.contact.emergency.relation', 'profile.contact.emergency.phone',
  'profile.address.province', 'profile.address.city', 'profile.address.zipCode', 'profile.address.detail',
  'company.name', 'company.department', 'company.position',
  'company.office.building', 'company.office.floor', 'company.office.seat',
  'settings.theme', 'settings.customColor',
  'settings.notifications.email', 'settings.notifications.sms', 'settings.notifications.dnd',
  'settings.notifications.dndStart', 'settings.notifications.dndEnd',
]
</script>
