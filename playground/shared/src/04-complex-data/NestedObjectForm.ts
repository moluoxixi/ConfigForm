import type { SceneConfig } from '../types'

/**
 * 场景：嵌套对象
 *
 * 覆盖：多级嵌套结构 / void Card 分组可视化 / void 不参与数据路径
 */

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

/** 紧急联系人关系选项 */
const RELATION_OPTIONS = [
  { label: '配偶', value: 'spouse' },
  { label: '父母', value: 'parent' },
  { label: '朋友', value: 'friend' },
]

/** 省份选项 */
const PROVINCE_OPTIONS = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' },
]

/** 主题选项 */
const THEME_OPTIONS = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
  { label: '自定义', value: 'custom' },
]

const config: SceneConfig = {
  title: '嵌套对象',
  description: '多级嵌套结构 / void Card 分组可视化 / void 不参与数据路径',

  initialValues: {
    title: '员工档案', name: '张三', age: 28, gender: 'male',
    phone: '13800138000', email: 'zhangsan@example.com',
    emergencyName: '李女士', emergencyRelation: 'spouse', emergencyPhone: '13900139000',
    province: 'beijing', city: '北京', zipCode: '100000', addressDetail: '朝阳区某某街道1号',
    companyName: '科技有限公司', department: '研发部', position: '高级工程师',
    building: 'A 栋', floor: '12F', seat: 'A-12-03',
    theme: 'light', customColor: '', emailNotify: true, smsNotify: false, dnd: false,
  },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '120px' },
    properties: {
      profileCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '👤 个人信息' },
        properties: {
          title: { type: 'string', title: '标题', required: true },
          name: { type: 'string', title: '姓名', required: true },
          age: { type: 'number', title: '年龄', componentProps: { min: 0, max: 150, style: { width: '100%' } } },
          gender: { type: 'string', title: '性别', enum: GENDER_OPTIONS },
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
          emergencyRelation: { type: 'string', title: '关系', enum: RELATION_OPTIONS },
          emergencyPhone: { type: 'string', title: '紧急联系电话' },
        },
      },
      addressCard: {
        type: 'void',
        component: 'LayoutCard',
        componentProps: { title: '📍 地址' },
        properties: {
          province: { type: 'string', title: '省份', enum: PROVINCE_OPTIONS },
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
          theme: { type: 'string', title: '主题', component: 'RadioGroup', default: 'light', enum: THEME_OPTIONS },
          customColor: {
            type: 'string', title: '自定义颜色', visible: false,
            reactions: [{ watch: 'theme', when: (v: unknown[]) => v[0] === 'custom', fulfill: { state: { visible: true, required: true } }, otherwise: { state: { visible: false, required: false } } }],
          },
          emailNotify: { type: 'boolean', title: '邮件通知' },
          smsNotify: { type: 'boolean', title: '短信通知' },
          dnd: { type: 'boolean', title: '免打扰' },
        },
      },
    },
  },

  fields: [
    /* 👤 个人信息 */
    { name: 'title', label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } },
    { name: 'name', label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } },
    { name: 'age', label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } } },
    { name: 'gender', label: '性别', component: 'Select', dataSource: GENDER_OPTIONS, componentProps: { placeholder: '请选择' } },
    /* 📞 联系方式 */
    { name: 'phone', label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' }, rules: [{ format: 'phone', message: '无效手机号' }] },
    { name: 'email', label: '邮箱', component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email', message: '无效邮箱' }] },
    { name: 'emergencyName', label: '紧急联系人', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'emergencyRelation', label: '关系', component: 'Select', dataSource: RELATION_OPTIONS, componentProps: { placeholder: '请选择' } },
    { name: 'emergencyPhone', label: '紧急联系电话', component: 'Input', componentProps: { placeholder: '请输入' } },
    /* 📍 地址 */
    { name: 'province', label: '省份', component: 'Select', dataSource: PROVINCE_OPTIONS, componentProps: { placeholder: '请选择' } },
    { name: 'city', label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } },
    { name: 'zipCode', label: '邮编', component: 'Input', componentProps: { placeholder: '请输入邮编' } },
    { name: 'addressDetail', label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址' } },
    /* 🏢 公司信息 */
    { name: 'companyName', label: '公司名称', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'department', label: '部门', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'position', label: '职位', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'building', label: '楼栋', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'floor', label: '楼层', component: 'Input', componentProps: { placeholder: '请输入' } },
    { name: 'seat', label: '工位号', component: 'Input', componentProps: { placeholder: '请输入' } },
    /* ⚙️ 偏好设置 */
    { name: 'theme', label: '主题', component: 'RadioGroup', dataSource: THEME_OPTIONS },
    { name: 'customColor', label: '自定义颜色', component: 'Input', componentProps: { placeholder: '请输入颜色值' } },
    { name: 'emailNotify', label: '邮件通知', component: 'Switch' },
    { name: 'smsNotify', label: '短信通知', component: 'Switch' },
    { name: 'dnd', label: '免打扰', component: 'Switch' },
  ],
}

export default config
