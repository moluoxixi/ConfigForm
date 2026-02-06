/**
 * 场景 19：依赖数据源
 *
 * 覆盖：
 * - 选项依赖其他字段值刷新
 * - 带参数的远程数据源（params 引用 $values）
 * - 多级依赖链（A → B → C 数据源联动）
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Divider } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/* ======================== Mock 数据 ======================== */

/** 品牌 → 型号映射 */
const BRAND_MODELS: Record<string, Array<{ label: string; value: string }>> = {
  apple: [
    { label: 'iPhone 15', value: 'iphone15' },
    { label: 'iPhone 14', value: 'iphone14' },
    { label: 'MacBook Pro', value: 'macbook-pro' },
  ],
  huawei: [
    { label: 'Mate 60', value: 'mate60' },
    { label: 'P60', value: 'p60' },
    { label: 'MateBook X', value: 'matebook-x' },
  ],
  xiaomi: [
    { label: '小米 14', value: 'mi14' },
    { label: 'Redmi Note 13', value: 'redmi-note13' },
  ],
};

/** 型号 → 配置映射 */
const MODEL_CONFIGS: Record<string, Array<{ label: string; value: string }>> = {
  iphone15: [{ label: '128GB', value: '128' }, { label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  iphone14: [{ label: '128GB', value: '128' }, { label: '256GB', value: '256' }],
  mate60: [{ label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  mi14: [{ label: '256GB', value: '256' }, { label: '512GB', value: '512' }, { label: '1TB', value: '1024' }],
};

/** 年级 → 班级映射 */
const GRADE_CLASSES: Record<string, Array<{ label: string; value: string }>> = {
  grade1: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }, { label: '3班', value: 'c3' }],
  grade2: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }],
  grade3: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }, { label: '3班', value: 'c3' }, { label: '4班', value: 'c4' }],
};

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '140px', pattern: mode },
    fields: {
      /* ---- 三级依赖：品牌 → 型号 → 配置 ---- */
      brand: {
        type: 'string',
        label: '品牌',
        required: true,
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请选择品牌',
        enum: [
          { label: 'Apple', value: 'apple' },
          { label: '华为', value: 'huawei' },
          { label: '小米', value: 'xiaomi' },
        ],
      },
      model: {
        type: 'string',
        label: '型号',
        required: true,
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请先选择品牌',
        description: '依赖「品牌」异步刷新选项',
        reactions: [
          {
            watch: 'brand',
            fulfill: {
              run: async (field, ctx) => {
                const brand = ctx.values.brand as string;
                field.setValue(undefined);
                if (!brand) { field.setDataSource([]); return; }

                field.loading = true;
                await new Promise((r) => setTimeout(r, 400));
                field.setDataSource(BRAND_MODELS[brand] ?? []);
                field.loading = false;
                field.setComponentProps({ placeholder: '请选择型号' });
              },
            },
          },
        ],
      },
      config: {
        type: 'string',
        label: '配置',
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请先选择型号',
        description: '依赖「型号」异步刷新选项',
        reactions: [
          {
            watch: 'model',
            fulfill: {
              run: async (field, ctx) => {
                const model = ctx.values.model as string;
                field.setValue(undefined);
                if (!model) { field.setDataSource([]); return; }

                field.loading = true;
                await new Promise((r) => setTimeout(r, 300));
                field.setDataSource(MODEL_CONFIGS[model] ?? []);
                field.loading = false;
                field.setComponentProps({ placeholder: '请选择配置' });
              },
            },
          },
        ],
      },

      /* ---- 年级 → 班级 ---- */
      grade: {
        type: 'string',
        label: '年级',
        required: true,
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请选择年级',
        enum: [
          { label: '一年级', value: 'grade1' },
          { label: '二年级', value: 'grade2' },
          { label: '三年级', value: 'grade3' },
        ],
      },
      classNo: {
        type: 'string',
        label: '班级',
        required: true,
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请先选择年级',
        description: '依赖「年级」刷新班级列表',
        reactions: [
          {
            watch: 'grade',
            fulfill: {
              run: async (field, ctx) => {
                const grade = ctx.values.grade as string;
                field.setValue(undefined);
                if (!grade) { field.setDataSource([]); return; }

                field.loading = true;
                await new Promise((r) => setTimeout(r, 300));
                field.setDataSource(GRADE_CLASSES[grade] ?? []);
                field.loading = false;
                field.setComponentProps({ placeholder: '请选择班级' });
              },
            },
          },
        ],
      },
    },
  };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  brand: undefined,
  model: undefined,
  config: undefined,
  grade: undefined,
  classNo: undefined,
};

/**
 * 依赖数据源示例
 */
export const DependentDataSourceForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>依赖数据源</Title>
      <Paragraph type="secondary">
        品牌 → 型号 → 配置（三级依赖链） / 年级 → 班级
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => setMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <ConfigForm
        key={mode}
        schema={schema}
        initialValues={savedValues}
        onValuesChange={(values) => setSavedValues(values as Record<string, unknown>)}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        {mode === 'editable' && (
          <>
            <Divider />
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </>
        )}
      </ConfigForm>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
