/**
 * 场景 18：异步选项加载
 *
 * 覆盖：
 * - 下拉选项远程获取（模拟异步加载）
 * - 加载中 loading 状态
 * - 数据源配置（labelField / valueField 映射）
 * - 缓存策略（重复打开不重复请求）
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '140px', pattern: mode },
    fields: {
      /* ---- 异步加载（通过 dataSource url） ---- */
      category: {
        type: 'string',
        label: '商品分类（远程）',
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '远程加载分类',
        description: '通过 dataSource.url 配置远程数据',
        dataSource: {
          url: '/api/categories',
          method: 'GET',
          labelField: 'name',
          valueField: 'id',
          cache: true,
        },
      },

      /* ---- 静态枚举选项 ---- */
      status: {
        type: 'string',
        label: '状态',
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请选择状态',
        enum: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'disabled' },
          { label: '待审核', value: 'pending' },
        ],
      },

      /* ---- reactions 异步加载选项 ---- */
      dynamicType: {
        type: 'string',
        label: '类型',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'fruit',
        enum: [
          { label: '水果', value: 'fruit' },
          { label: '蔬菜', value: 'vegetable' },
          { label: '肉类', value: 'meat' },
        ],
      },
      dynamicItem: {
        type: 'string',
        label: '具体品种（异步）',
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '根据类型异步加载选项',
        description: '通过 reactions 异步加载 dataSource',
        reactions: [
          {
            watch: 'dynamicType',
            fulfill: {
              run: async (field, ctx) => {
                const type = ctx.values.dynamicType as string;
                if (!type) {
                  field.setDataSource([]);
                  return;
                }

                field.loading = true;
                field.setValue(undefined);

                /* 模拟异步请求延迟 */
                await new Promise((resolve) => setTimeout(resolve, 600));

                const mockData: Record<string, Array<{ label: string; value: string }>> = {
                  fruit: [
                    { label: '苹果', value: 'apple' },
                    { label: '香蕉', value: 'banana' },
                    { label: '橙子', value: 'orange' },
                    { label: '葡萄', value: 'grape' },
                  ],
                  vegetable: [
                    { label: '白菜', value: 'cabbage' },
                    { label: '胡萝卜', value: 'carrot' },
                    { label: '西红柿', value: 'tomato' },
                  ],
                  meat: [
                    { label: '猪肉', value: 'pork' },
                    { label: '牛肉', value: 'beef' },
                    { label: '鸡肉', value: 'chicken' },
                  ],
                };

                field.setDataSource(mockData[type] ?? []);
                field.loading = false;
              },
            },
          },
        ],
      },

      /* ---- 带默认值的异步选项 ---- */
      country: {
        type: 'string',
        label: '国家',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'china',
        enum: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
          { label: '日本', value: 'japan' },
        ],
      },

      remark: {
        type: 'string',
        label: '备注',
        component: 'Textarea',
        wrapper: 'FormItem',
        placeholder: '请输入备注',
      },
    },
  };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  category: undefined,
  status: undefined,
  dynamicType: 'fruit',
  dynamicItem: undefined,
  country: 'china',
  remark: '',
};

/**
 * 异步选项加载示例
 */
export const AsyncOptionsForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>异步选项加载</Title>
      <Paragraph type="secondary">
        远程 dataSource / reactions 异步加载 / loading 状态 / 缓存策略
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <span>
            切换「类型」下拉可看到<Text strong>具体品种</Text>异步加载过程（模拟 600ms 延迟）
          </span>
        }
      />

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
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button htmlType="reset">重置</Button>
          </Space>
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
