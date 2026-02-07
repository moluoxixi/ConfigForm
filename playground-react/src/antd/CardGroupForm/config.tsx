/**
 * 场景 24：卡片分组
 *
 * 覆盖：
 * - Card 组件包裹字段组
 * - 多卡片布局
 * - 卡片内独立验证提示
 * - 三种模式切换
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: '', password: '', confirmPwd: '', realName: '', gender: undefined, birthday: '',
  email: '', phone: '', address: '',
};

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  layout: {
    type: 'groups',
    groups: [
      { title: '账户信息', component: 'Card', fields: ['username', 'password', 'confirmPwd'] },
      { title: '个人信息', component: 'Card', fields: ['realName', 'gender', 'birthday'] },
      { title: '联系方式', component: 'Card', fields: ['email', 'phone', 'address'] },
    ],
  },
  properties: {
    username: { type: 'string', title: '用户名', required: true, placeholder: '请输入用户名', rules: [{ minLength: 3, message: '至少 3 字符' }] },
    password: { type: 'string', title: '密码', required: true, component: 'Password', placeholder: '请输入密码', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    confirmPwd: {
      type: 'string', title: '确认密码', required: true, component: 'Password', placeholder: '再次输入',
      rules: [{ validator: (v, _r, ctx) => { if (v !== ctx.getFieldValue('password')) return '密码不一致'; return undefined; }, trigger: 'blur' }],
    },
    realName: { type: 'string', title: '真实姓名', required: true, placeholder: '请输入姓名' },
    gender: {
      type: 'string', title: '性别', component: 'RadioGroup',
      enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }],
    },
    birthday: { type: 'string', title: '生日', component: 'DatePicker' },
    email: { type: 'string', title: '邮箱', required: true, placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', title: '手机号', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
    address: { type: 'string', title: '地址', component: 'Textarea', placeholder: '请输入地址' },
  },
};

export const CardGroupForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>卡片分组</Title>
      <Paragraph type="secondary">Card 多卡片分组布局 / 卡片内独立验证</Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={(errors) => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  );
});
