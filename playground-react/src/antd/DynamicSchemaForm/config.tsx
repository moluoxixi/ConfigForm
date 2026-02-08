import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { mergeSchema } from '@moluoxixi/schema'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 26：动态 Schema
 *
 * 覆盖：
 * - 运行时 Schema 合并（mergeSchema）
 * - 场景切换（个人 / 企业 / 学生）
 * - Schema 热更新
 * - 三种模式切换
 */
import React, { useMemo, useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

type ScenarioKey = 'individual' | 'enterprise' | 'student'

/** 基础 Schema（所有场景共享） */
const BASE_SCHEMA: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  properties: {
    name: { type: 'string', title: '姓名', required: true, placeholder: '请输入姓名', order: 1 },
    phone: { type: 'string', title: '手机号', required: true, placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }], order: 2 },
    email: { type: 'string', title: '邮箱', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }], order: 3 },
    remark: { type: 'string', title: '备注', component: 'Textarea', placeholder: '请输入备注', order: 99 },
  },
}

/** 场景覆盖 Schema */
const SCENARIO_SCHEMAS: Record<ScenarioKey, { label: string, override: Partial<ISchema> }> = {
  individual: {
    label: '个人用户',
    override: {
      properties: {
        idCard: { type: 'string', title: '身份证号', required: true, placeholder: '18 位身份证号', rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证号' }], order: 4 },
        city: { type: 'string', title: '居住城市', component: 'Select', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广州', value: 'guangzhou' }], order: 5 },
      },
    },
  },
  enterprise: {
    label: '企业用户',
    override: {
      properties: {
        name: { type: 'string', title: '联系人', required: true, placeholder: '联系人姓名', order: 1 },
        companyName: { type: 'string', title: '公司名称', required: true, placeholder: '公司全称', order: 4 },
        creditCode: { type: 'string', title: '信用代码', required: true, placeholder: '18 位信用代码', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }], order: 5 },
        industry: { type: 'string', title: '行业', component: 'Select', enum: [{ label: 'IT', value: 'it' }, { label: '金融', value: 'finance' }, { label: '制造', value: 'mfg' }], order: 6 },
      },
    },
  },
  student: {
    label: '学生认证',
    override: {
      properties: {
        school: { type: 'string', title: '学校', required: true, placeholder: '学校全称', order: 4 },
        studentId: { type: 'string', title: '学号', required: true, placeholder: '学号', rules: [{ pattern: /^\d{8,14}$/, message: '学号 8-14 位数字' }], order: 5 },
        major: { type: 'string', title: '专业', required: true, placeholder: '专业名称', order: 6 },
      },
    },
  },
}

/** 场景选项 */
const SCENARIO_OPTIONS: Array<{ label: string, value: ScenarioKey }> = Object.entries(SCENARIO_SCHEMAS).map(([k, v]) => ({ label: v.label, value: k as ScenarioKey }))

export const DynamicSchemaForm = observer((): React.ReactElement => {
  const [scenario, setScenario] = useState<ScenarioKey>('individual')

  const mergedSchema = useMemo<ISchema>(() => {
    return mergeSchema(BASE_SCHEMA, SCENARIO_SCHEMAS[scenario].override)
  }, [scenario])

  return (
    <div>
      <h2>动态 Schema</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>mergeSchema 合并 / 场景切换 / 热更新</p>

      {/* Segmented → 原生按钮组 */}
      <div style={{ display: 'inline-flex', background: '#f5f5f5', borderRadius: 6, padding: 2, marginBottom: 16 }}>
        {SCENARIO_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setScenario(opt.value)}
            style={{
              padding: '4px 16px',
              fontSize: 14,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: scenario === opt.value ? '#fff' : 'transparent',
              boxShadow: scenario === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              fontWeight: scenario === opt.value ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a' }}>
          当前：
          {SCENARIO_SCHEMAS[scenario].label}
          {' '}
          | 字段数：
          {Object.keys(mergedSchema.fields).length}
        </span>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(mergedSchema, mode)}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>

      {/* Collapse → details/summary */}
      <details style={{ marginTop: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
        <summary style={{ padding: '8px 16px', cursor: 'pointer', background: '#fafafa', borderRadius: '8px 8px 0 0', fontSize: 14 }}>查看合并后 Schema</summary>
        <div style={{ padding: '8px 16px' }}>
          <pre style={{ margin: 0, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(mergedSchema, null, 2)}</pre>
        </div>
      </details>
    </div>
  )
})
