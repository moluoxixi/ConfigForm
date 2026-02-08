import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { EnvironmentOutlined } from '@ant-design/icons'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 30：地图选点 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 MapCoordinatePicker 组件注册
 * - 地图选点集成（模拟实现）
 * - 经纬度坐标同步
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <span>经度：</span>
        <input
          type="number"
          value={coords.lng}
          onChange={e => onChange?.({ ...coords, lng: Number(e.target.value) || coords.lng })}
          disabled={isDisabled}
          style={{ width: 150, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }}
          step={0.0001}
        />
        <span>纬度：</span>
        <input
          type="number"
          value={coords.lat}
          onChange={e => onChange?.({ ...coords, lat: Number(e.target.value) || coords.lat })}
          disabled={isDisabled}
          style={{ width: 150, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }}
          step={0.0001}
        />
      </div>
    </div>
  )
})

registerComponent('MapCoordinatePicker', MapCoordinatePicker, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  locationName: '天安门广场',
  coordinates: { lng: 116.3912, lat: 39.9075 },
  address: '北京市东城区',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    locationName: {
      type: 'string',
      title: '地点名称',
      required: true,
      component: 'Input',
    },
    coordinates: {
      type: 'object',
      title: '地图选点',
      required: true,
      component: 'MapCoordinatePicker',
    },
    address: {
      type: 'string',
      title: '详细地址',
      component: 'Input',
    },
  },
}

/**
 * 地图选点表单 — ConfigForm + Schema
 *
 * 展示模拟地图选点、经纬度同步、三种模式切换
 */
export const MapPickerForm = observer((): React.ReactElement => (
  <div>
    <h2>地图选点</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>模拟地图选点 / 经纬度同步 / 三种模式 — ConfigForm + Schema</p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
