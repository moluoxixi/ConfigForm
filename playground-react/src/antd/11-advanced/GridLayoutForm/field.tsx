/**
 * Grid 栅格布局 — Field 模式
 *
 * 使用 FormProvider + FormField + CSS Grid 实现栅格布局。
 * 24 列栅格，通过 grid-column: span N 控制字段宽度。
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/**
 * Grid 栅格布局（Field 版）
 *
 * 通过 CSS Grid 24 列体系 + FormField 实现栅格布局。
 */
export const GridLayoutForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: undefined,
      address: '',
      province: undefined,
      city: '',
      zipCode: '',
      phone: '',
      notification: false,
    },
  });

  return (
    <div>
      <h2>Grid 栅格布局</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        CSS Grid 栅格布局 — FormField + grid 样式实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider form={form}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 16 }}>
                {/* span 12 + 12 */}
                <div style={{ gridColumn: 'span 12' }}>
                  <FormField name="firstName" fieldProps={{ label: '姓', required: true, component: 'Input', componentProps: { placeholder: '请输入姓氏' } }} />
                </div>
                <div style={{ gridColumn: 'span 12' }}>
                  <FormField name="lastName" fieldProps={{ label: '名', required: true, component: 'Input', componentProps: { placeholder: '请输入名字' } }} />
                </div>
                {/* span 16 + 8 */}
                <div style={{ gridColumn: 'span 16' }}>
                  <FormField name="email" fieldProps={{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '请输入有效邮箱' }], componentProps: { placeholder: 'user@example.com' } }} />
                </div>
                <div style={{ gridColumn: 'span 8' }}>
                  <FormField name="age" fieldProps={{ label: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: { width: '100%' } } }} />
                </div>
                {/* span 24 */}
                <div style={{ gridColumn: 'span 24' }}>
                  <FormField name="address" fieldProps={{ label: '详细地址', component: 'Textarea', componentProps: { placeholder: '请输入详细地址', rows: 2 } }} />
                </div>
                {/* span 8 + 8 + 8 */}
                <div style={{ gridColumn: 'span 8' }}>
                  <FormField name="province" fieldProps={{ label: '省份', component: 'Select', dataSource: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }] }} />
                </div>
                <div style={{ gridColumn: 'span 8' }}>
                  <FormField name="city" fieldProps={{ label: '城市', component: 'Input', componentProps: { placeholder: '请输入城市' } }} />
                </div>
                <div style={{ gridColumn: 'span 8' }}>
                  <FormField name="zipCode" fieldProps={{ label: '邮编', component: 'Input', componentProps: { placeholder: '100000' } }} />
                </div>
                {/* span 12 + 12 */}
                <div style={{ gridColumn: 'span 12' }}>
                  <FormField name="phone" fieldProps={{ label: '手机号', component: 'Input', rules: [{ format: 'phone', message: '请输入有效手机号' }] }} />
                </div>
                <div style={{ gridColumn: 'span 12' }}>
                  <FormField name="notification" fieldProps={{ label: '接收通知', component: 'Switch' }} />
                </div>
              </div>
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
