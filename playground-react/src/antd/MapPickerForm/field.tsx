import type { FieldInstance } from '@moluoxixi/core'
import { EnvironmentOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Alert, Form, Input, InputNumber, Space, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 30：地图选点
 *
 * 覆盖：
 * - 地图选点集成（模拟实现，实际可接入 react-amap）
 * - 经纬度坐标同步
 * - 地址反查
 * - 三种模式切换
 */
import React, { useEffect } from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 模拟地图选点组件（实际项目中替换为 react-amap 组件） */
const MapPicker = observer(({
  lng,
  lat,
  onChange,
  disabled,
}: {
  lng: number
  lat: number
  onChange: (lng: number, lat: number) => void
  disabled: boolean
}): React.ReactElement => {
  /** 模拟点击地图选点 */
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (disabled)
      return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    /* 将像素映射到经纬度范围 */
    const newLng = 73 + (x / rect.width) * (135 - 73)
    const newLat = 53 - (y / rect.height) * (53 - 3)
    onChange(Math.round(newLng * 10000) / 10000, Math.round(newLat * 10000) / 10000)
  }

  /* 将经纬度映射到像素位置 */
  const markerX = ((lng - 73) / (135 - 73)) * 100
  const markerY = ((53 - lat) / (53 - 3)) * 100

  return (
    <div
      onClick={handleMapClick}
      style={{
        width: '100%',
        height: 300,
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2dfdb 50%, #a5d6a7 100%)',
        borderRadius: 8,
        border: '1px solid #d9d9d9',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'crosshair',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* 网格线 */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <React.Fragment key={i}>
            <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#00000010" />
            <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#00000010" />
          </React.Fragment>
        ))}
      </svg>

      {/* 标记点 */}
      <div style={{
        position: 'absolute',
        left: `${markerX}%`,
        top: `${markerY}%`,
        transform: 'translate(-50%, -100%)',
        transition: 'all 0.2s',
      }}
      >
        <EnvironmentOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
      </div>

      {/* 坐标信息 */}
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
        经度:
        {' '}
        {lng.toFixed(4)}
        {' '}
        | 纬度:
        {' '}
        {lat.toFixed(4)}
      </div>

      {!disabled && (
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
          点击选择位置（模拟中国地图范围）
        </div>
      )}
    </div>
  )
})

export const MapPickerForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075, address: '北京市东城区' },
  })

  useEffect(() => {
    form.createField({ name: 'locationName', label: '地点名称', required: true })
    form.createField({ name: 'lng', label: '经度', required: true })
    form.createField({ name: 'lat', label: '纬度', required: true })
    form.createField({ name: 'address', label: '详细地址' })
  }, [])

  const handleMapChange = (lng: number, lat: number): void => {
    form.setFieldValue('lng', lng)
    form.setFieldValue('lat', lat)
    form.setFieldValue('address', `经度 ${lng}，纬度 ${lat} 附近`)
  }

  return (
    <div>
      <Title level={3}>地图选点</Title>
      <Paragraph type="secondary">模拟地图选点（实际项目可接入 react-amap） / 经纬度同步 / 三种模式</Paragraph>

      <Alert type="info" showIcon style={{ marginBottom: 16 }} message="此为模拟地图，点击区域可选点。实际项目请安装 react-amap 并接入高德地图 API。" />

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <FormField name="locationName">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                  </Form.Item>
                )}
              </FormField>

              <Form.Item label="地图选点">
                <MapPicker
                  lng={(form.getFieldValue('lng') as number) ?? 116}
                  lat={(form.getFieldValue('lat') as number) ?? 39}
                  onChange={handleMapChange}
                  disabled={mode !== 'editable'}
                />
              </Form.Item>

              <Space style={{ marginBottom: 16 }}>
                <FormField name="lng">
                  {(field: FieldInstance) => (
                    <Form.Item label="经度" style={{ marginBottom: 0 }}>
                      <InputNumber value={field.value as number} onChange={v => field.setValue(v)} disabled={mode !== 'editable'} style={{ width: 150 }} step={0.0001} />
                    </Form.Item>
                  )}
                </FormField>
                <FormField name="lat">
                  {(field: FieldInstance) => (
                    <Form.Item label="纬度" style={{ marginBottom: 0 }}>
                      <InputNumber value={field.value as number} onChange={v => field.setValue(v)} disabled={mode !== 'editable'} style={{ width: 150 }} step={0.0001} />
                    </Form.Item>
                  )}
                </FormField>
              </Space>

              <FormField name="address">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label}>
                    <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                  </Form.Item>
                )}
              </FormField>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
