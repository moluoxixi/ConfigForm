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
}

export default config
