/**
 * 场景渲染器
 *
 * 使用 ConfigForm + SchemaField 递归渲染 schema.properties。
 * StatusTabs 提供编辑态/阅读态/禁用态三态切换。
 * 当场景配置包含 schemaVariants 时，渲染变体切换 UI（如布局切换）。
 */
import type { FieldPattern, ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { i18n as I18nInstance } from 'i18next'
import { isI18nKey, translateSchema } from '@moluoxixi/core'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { ConfigForm } from '@moluoxixi/react'
import { StatusTabs } from '@moluoxixi/ui-antd'
import { createInstance } from 'i18next'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'

/** DevTools 插件单例（所有场景共用，避免重复创建） */
const devTools = devToolsPlugin({ formId: 'playground' })

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return {
    ...s,
    pattern: mode,
    decoratorProps: { ...s.decoratorProps, pattern: mode },
  }
}

function translateText(value: string, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (isI18nKey(value))
    return t(value.slice(3))
  return value
}

export interface SceneRendererProps {
  config: SceneConfig
}

interface SceneFormProps {
  config: SceneConfig
  schema: ISchema
  mode: FieldPattern
  showResult: (data: Record<string, unknown>) => void
  showErrors: (errors: Array<{ path: string, message: string }>) => void
}

function SceneForm({ config, schema, mode, showResult, showErrors }: SceneFormProps): React.ReactElement {
  useEffect(() => {
    showErrors([])
  }, [mode, showErrors])

  const handleReset = useCallback(() => {
    showErrors([])
  }, [showErrors])

  return (
    <ConfigForm
      schema={withMode(schema, mode)}
      initialValues={config.initialValues}
      formConfig={{
        effects: config.effects,
        plugins: [...(config.plugins ?? []), devTools],
      }}
      onSubmit={showResult}
      onSubmitFailed={errors => showErrors(errors)}
      onReset={handleReset}
    />
  )
}

export const SceneRenderer = observer(({ config }: SceneRendererProps): React.ReactElement => {
  const variants = config.schemaVariants
  const [variantValue, setVariantValue] = useState(variants?.defaultValue ?? '')
  const i18nConfig = config.i18n
  const resolvedLocaleOptions = useMemo(() => {
    if (!i18nConfig)
      return []
    if (config.localeOptions && config.localeOptions.length > 0)
      return config.localeOptions
    return Object.keys(i18nConfig.messages ?? {}).map(key => ({ label: key, value: key }))
  }, [config.localeOptions, i18nConfig])
  const defaultLocale = useMemo(() => {
    if (!i18nConfig)
      return ''
    return i18nConfig.defaultLocale
      ?? resolvedLocaleOptions[0]?.value
      ?? Object.keys(i18nConfig.messages ?? {})[0]
      ?? ''
  }, [i18nConfig, resolvedLocaleOptions])
  const [locale, setLocale] = useState(defaultLocale)

  useEffect(() => {
    if (!i18nConfig)
      return
    if (defaultLocale && locale !== defaultLocale) {
      setLocale(defaultLocale)
    }
  }, [defaultLocale, i18nConfig, locale])

  /** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
  const currentSchema = useMemo<ISchema>(() => {
    if (variants && variantValue) {
      return variants.factory(variantValue)
    }
    return config.schema
  }, [config.schema, variants, variantValue])

  const i18nResources = useMemo(() => {
    if (!i18nConfig)
      return {}
    return Object.fromEntries(
      Object.entries(i18nConfig.messages ?? {}).map(([lng, messages]) => [lng, { translation: messages }]),
    )
  }, [i18nConfig])

  const i18nInstance = useMemo<I18nInstance | null>(() => {
    if (!i18nConfig)
      return null
    const instance = createInstance()
    void instance
      .use(initReactI18next)
      .init({
        resources: i18nResources,
        lng: defaultLocale || 'zh-CN',
        fallbackLng: defaultLocale || 'zh-CN',
        interpolation: { escapeValue: false },
      })
    return instance
  }, [defaultLocale, i18nConfig, i18nResources])

  useEffect(() => {
    if (i18nInstance && locale) {
      void i18nInstance.changeLanguage(locale)
    }
  }, [i18nInstance, locale])

  const t = useCallback((key: string, params?: Record<string, unknown>) => {
    if (!i18nInstance)
      return key
    return i18nInstance.t(key, params as Record<string, unknown>)
  }, [i18nInstance])

  const localizedSchema = useMemo(() => {
    if (!i18nConfig || !i18nInstance)
      return currentSchema
    return translateSchema(currentSchema, { t })
  }, [currentSchema, i18nConfig, i18nInstance, locale, t])

  const title = useMemo(() => {
    if (!i18nConfig || !i18nInstance)
      return config.title
    return translateText(config.title, t)
  }, [config.title, i18nConfig, i18nInstance, locale, t])

  const description = useMemo(() => {
    if (!i18nConfig || !i18nInstance)
      return config.description
    return translateText(config.description, t)
  }, [config.description, i18nConfig, i18nInstance, locale, t])

  const content = (
    <div>
      <h2>{title}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {description}
      </p>

      {/* 语言切换器 */}
      {i18nConfig && resolvedLocaleOptions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            语言：
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {resolvedLocaleOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocale(opt.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  border: locale === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: locale === opt.value ? '#e6f4ff' : '#fff',
                  color: locale === opt.value ? '#1677ff' : '#333',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schema 变体切换器（如布局切换） */}
      {variants && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            {variants.label}
            ：
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {variants.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVariantValue(opt.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  border: variantValue === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: variantValue === opt.value ? '#e6f4ff' : '#fff',
                  color: variantValue === opt.value ? '#1677ff' : '#333',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <SceneForm
            config={config}
            schema={localizedSchema}
            mode={mode}
            showResult={showResult}
            showErrors={showErrors}
          />
        )}
      </StatusTabs>
    </div>
  )

  if (i18nInstance)
    return <I18nextProvider i18n={i18nInstance}>{content}</I18nextProvider>
  return content
})
