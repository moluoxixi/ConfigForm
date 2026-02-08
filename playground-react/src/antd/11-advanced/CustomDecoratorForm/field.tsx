/**
 * 自定义装饰器 — Field 模式
 *
 * 使用 FormProvider + FormField，通过外层 div 模拟不同装饰器样式：
 * - 卡片装饰器（带背景和圆角的卡片包裹）
 * - 内联装饰器（左标签右内容的紧凑布局）
 * - 默认 FormItem 装饰器
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/**
 * 自定义装饰器（Field 版）
 *
 * 通过外层 div 包裹 FormField 实现卡片 / 内联 / 默认三种装饰器布局。
 */
export const CustomDecoratorForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      projectName: '',
      projectCode: '',
      description: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      budget: 0,
      startDate: '',
    },
  });

  return (
    <div>
      <h2>自定义装饰器</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        自定义装饰器包裹字段 — FormField + 自定义 wrapper 实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider form={form}>
              {/* 卡片装饰器包裹 */}
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, marginBottom: 12, background: '#fafafa' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>项目名称 <span style={{ color: '#ff4d4f' }}>*</span></div>
                <FormField name="projectName" fieldProps={{ label: '项目名称', required: true, component: 'Input', componentProps: { placeholder: '请输入项目名称' } }} />
                <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>请输入项目的完整名称</div>
              </div>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, marginBottom: 12, background: '#fafafa' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>项目编号 <span style={{ color: '#ff4d4f' }}>*</span></div>
                <FormField name="projectCode" fieldProps={{ label: '项目编号', required: true, component: 'Input', rules: [{ pattern: '^[A-Z]{2}-\\d{4}$', message: '格式：XX-0000' }] }} />
              </div>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, marginBottom: 12, background: '#fafafa' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>项目描述</div>
                <FormField name="description" fieldProps={{ label: '项目描述', component: 'Textarea' }} />
                <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>不超过500字</div>
              </div>
              {/* 内联装饰器包裹 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '8px 0', borderBottom: '1px dashed #e8e8e8' }}>
                <span style={{ minWidth: 80, fontSize: 13, color: '#555' }}>联系人 <span style={{ color: '#ff4d4f' }}>*</span></span>
                <div style={{ flex: 1 }}>
                  <FormField name="contactName" fieldProps={{ label: '联系人', required: true, component: 'Input' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '8px 0', borderBottom: '1px dashed #e8e8e8' }}>
                <span style={{ minWidth: 80, fontSize: 13, color: '#555' }}>电话</span>
                <div style={{ flex: 1 }}>
                  <FormField name="contactPhone" fieldProps={{ label: '电话', component: 'Input', rules: [{ format: 'phone', message: '请输入有效手机号' }] }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '8px 0', borderBottom: '1px dashed #e8e8e8' }}>
                <span style={{ minWidth: 80, fontSize: 13, color: '#555' }}>邮箱</span>
                <div style={{ flex: 1 }}>
                  <FormField name="contactEmail" fieldProps={{ label: '邮箱', component: 'Input', rules: [{ format: 'email', message: '请输入有效邮箱' }] }} />
                </div>
              </div>
              {/* 默认 FormItem 装饰器 */}
              <FormField name="budget" fieldProps={{ label: '预算（万元）', component: 'InputNumber', componentProps: { min: 0 } }} />
              <FormField name="startDate" fieldProps={{ label: '开始日期', component: 'DatePicker', componentProps: { style: { width: '100%' } } }} />
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
