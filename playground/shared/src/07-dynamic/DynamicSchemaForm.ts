import type { ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '../types'
import { mergeSchema } from '@moluoxixi/core'

/**
 * 场景：动态 Schema 合并
 *
 * 演示 mergeSchema API：
 * - 基础 schema 包含公共字段（姓名、手机、邮箱、备注）
 * - 通过 schemaVariants 切换不同场景（个人/企业/学生）
 * - 每个场景的额外字段通过 mergeSchema 合并到基础 schema
 */

/** 基础 Schema（公共字段） */
const BASE_SCHEMA: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    name: { type: 'string', title: '姓名', required: true },
    phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
    email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    remark: { type: 'string', title: '备注', component: 'Textarea' },
  },
}

/** 个人场景的额外字段 */
const PERSONAL_OVERLAY: ISchema = {
  properties: {
    idCard: { type: 'string', title: '身份证号', required: true, rules: [{ pattern: '^\\d{17}[\\dX]$', message: '请输入18位身份证号' }] },
    city: { type: 'string', title: '城市', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] },
  },
}

/** 企业场景的额外字段 */
const ENTERPRISE_OVERLAY: ISchema = {
  properties: {
    companyName: { type: 'string', title: '公司名称', required: true },
    creditCode: { type: 'string', title: '统一信用代码', required: true, rules: [{ pattern: '^[A-Z0-9]{18}$', message: '请输入18位统一信用代码' }] },
  },
}

/** 学生场景的额外字段 */
const STUDENT_OVERLAY: ISchema = {
  properties: {
    school: { type: 'string', title: '学校', required: true },
    studentId: { type: 'string', title: '学号', required: true },
    major: { type: 'string', title: '专业' },
  },
}

/**
 * OVERLAYS：变量或常量声明。
 * 所属模块：`playground/shared/src/07-dynamic/DynamicSchemaForm.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const OVERLAYS: Record<string, ISchema> = {
  personal: PERSONAL_OVERLAY,
  enterprise: ENTERPRISE_OVERLAY,
  student: STUDENT_OVERLAY,
}

/**
 * config：变量或常量声明。
 * 所属模块：`playground/shared/src/07-dynamic/DynamicSchemaForm.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const config: SceneConfig = {
  title: '动态 Schema 合并',
  description: 'mergeSchema — 基础 schema + 场景覆盖层，切换场景动态合并',

  initialValues: {
    name: '',
    phone: '',
    email: '',
    remark: '',
    idCard: '',
    city: undefined,
    companyName: '',
    creditCode: '',
    school: '',
    studentId: '',
    major: '',
  },

  schemaVariants: {
    label: '场景切换',
    options: [
      { label: '个人', value: 'personal' },
      { label: '企业', value: 'enterprise' },
      { label: '学生', value: 'student' },
    ],
    defaultValue: 'personal',
    /**
     * factory：执行当前功能逻辑。
     *
     * @param value 参数 value 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    factory: (value: string): ISchema => {
      const overlay = OVERLAYS[value]
      if (!overlay)
        return BASE_SCHEMA
      return mergeSchema(BASE_SCHEMA, overlay)
    },
  },

  schema: BASE_SCHEMA,
}

export default config
