/**
 * 场景 30：地图选点
 *
 * 覆盖：
 * - 地图选点集成（模拟实现，实际可接入 react-amap）
 * - 经纬度坐标同步
 * - 地址反查
 * - 三种模式切换
 *
 * 自定义 MapCoordinatePicker 组件注册后，在 fieldProps 中通过 component: 'MapCoordinatePicker' 引用。
 * 坐标以 { lng, lat } 对象存储在单个字段中，地址字段通过 onFieldValueChange 联动更新。
 */
import React, { useEffect } from 'react'
import { EnvironmentOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Alert, InputNumber, Space, Typography } from 'antd'

const { Title, Paragraph } = Typography

setupAntd()

/** 中国地图经度范围 */
const LNG_MIN = 73
const LNG_MAX = 135
/** 中国地图纬度范围 */
const LAT_MIN = 3
const LAT_MAX = 53

/** 坐标值类型 */
interface Coordinates {
  lng: number
  lat: number
}

// ========== 自定义组件：地图坐标选择器 ==========

/** 地图坐标选择器 Props */
interface MapCoordinatePickerProps {
  /** 坐标值 { lng, lat } */
  value?: Coordinates
  /** 值变更回调 */
  onChange?: (v: Coordinates) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 地图坐标选择器组件
 *
 * 模拟地图选点（实际项目可接入 react-amap），包含：
 * - 可视化地图区域 + 标记点
 * - 经度/纬度数字输入
 */
const MapCoordinatePicker = observer(({ value, onChange, disabled, readOnly }: MapCoordinatePickerProps): React.ReactElement => {
  const coords = value ?? { lng: 116.3912, lat: 39.9075 }
  const isDisabled = disabled || readOnly

  /** 模拟点击地图选点 */
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (isDisabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    /* 将像素映射到经纬度范围 */
    const newLng = LNG_MIN + (x / rect.width) * (LNG_MAX - LNG_MIN)
    const newLat = LAT_MAX - (y / rect.height) * (LAT_MAX - LAT_MIN)
    onChange?.({
      lng: Math.round(newLng * 10000) / 10000,
      lat: Math.round(newLat * 10000) / 10000,
    })
  }

  /* 将经纬度映射到像素百分比 */
  const markerX = ((coords.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100
  const markerY = ((LAT_MAX - coords.lat) / (LAT_MAX - LAT_MIN)) * 100

  return (
    <div>
      {/* 模拟地图区域 */}
      <div
        onClick={handleMapClick}
        style={{
          width: '100%',
          height: 300,
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2dfdb 50%, #a5d6a7 100%)',
          borderRadius: 8,
          border: '1px solid #d9d9d9',
          position: 'relative',
          cursor: isDisabled ? 'not-allowed' : 'crosshair',
          overflow: 'hidden',
          opacity: isDisabled ? 0.6 : 1,
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
          {coords.lng.toFixed(4)}
          {' '}
          | 纬度:
          {' '}
          {coords.lat.toFixed(4)}
        </div>

        {!isDisabled && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
            点击选择位置（模拟中国地图范围）
          </div>
        )}
      </div>

      {/* 经度/纬度输入 */}
      <Space style={{ marginTop: 8 }}>
        <span>经度：</span>
        <InputNumber
          value={coords.lng}
          onChange={v => onChange?.({ ...coords, lng: (v as number) ?? coords.lng })}
          disabled={isDisabled}
          style={{ width: 150 }}
          step={0.0001}
        />
        <span>纬度：</span>
        <InputNumber
          value={coords.lat}
          onChange={v => onChange?.({ ...coords, lat: (v as number) ?? coords.lat })}
          disabled={isDisabled}
          style={{ width: 150 }}
          step={0.0001}
        />
      </Space>
    </div>
  )
})

registerComponent('MapCoordinatePicker', MapCoordinatePicker, { defaultWrapper: 'FormItem' })

// ========== 表单组件 ==========

/**
 * 地图选点表单
 *
 * 展示模拟地图选点、经纬度同步、地址联动、三种模式切换
 */
export const MapPickerForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      locationName: '天安门广场',
      coordinates: { lng: 116.3912, lat: 39.9075 },
      address: '北京市东城区',
    },
  })

  /* 坐标变更时自动更新地址（模拟地理反查） */
  useEffect(() => {
    return form.onFieldValueChange('coordinates', (val: unknown) => {
      const coords = val as Coordinates | null
      if (coords) {
        form.setFieldValue('address', `经度 ${coords.lng}，纬度 ${coords.lat} 附近`)
      }
    })
  }, [form])

  return (
    <div>
      <Title level={3}>地图选点</Title>
      <Paragraph type="secondary">模拟地图选点（实际项目可接入 react-amap） / 经纬度同步 / 三种模式</Paragraph>
      <Alert type="info" showIcon style={{ marginBottom: 16 }} message="此为模拟地图，点击区域可选点。实际项目请安装 react-amap 并接入高德地图 API。" />
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="locationName" fieldProps={{ label: '地点名称', required: true, component: 'Input' }} />
                <FormField name="coordinates" fieldProps={{ label: '地图选点', required: true, component: 'MapCoordinatePicker' }} />
                <FormField name="address" fieldProps={{ label: '详细地址', component: 'Input' }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
