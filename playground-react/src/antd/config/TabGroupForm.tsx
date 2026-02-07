/**
 * 场景 22：标签页切换分组
 *
 * 覆盖：
 * - Tabs 组件分组字段
 * - Tab 切换时保留数据
 * - 每个 Tab 独立验证
 * - 三种模式切换
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  department: undefined,
  bio: '',
  website: '',
  github: '',
};

/** 表单 Schema */
const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  layout: {
    type: 'tabs',
    tabs: [
      { title: '基本信息', fields: ['name', 'email', 'phone'], showErrorBadge: true },
      { title: '工作信息', fields: ['company', 'position', 'department'], showErrorBadge: true },
      { title: '其他信息', fields: ['bio', 'website', 'github'], showErrorBadge: true },
    ],
  },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '请输入有效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '请输入有效手机号' }] },
    company: { type: 'string', label: '公司', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入公司名称' },
    position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem', placeholder: '请输入职位' },
    department: {
      type: 'string',
      label: '部门',
      component: 'Select',
      wrapper: 'FormItem',
      placeholder: '请选择部门',
      enum: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }],
    },
    bio: { type: 'string', label: '个人简介', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入简介', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
    website: { type: 'string', label: '个人网站', component: 'Input', wrapper: 'FormItem', placeholder: 'https://example.com', rules: [{ format: 'url', message: '请输入有效 URL' }] },
    github: { type: 'string', label: 'GitHub', component: 'Input', wrapper: 'FormItem', placeholder: 'GitHub 地址' },
  },
};

/**
 * 标签页分组示例
 */
export const TabGroupForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>标签页切换分组</Title>
      <Paragraph type="secondary">
        Tabs 分组 / 切换保留数据 / Tab 错误徽标 / 独立验证
      </Paragraph>
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
