import type { FormPlugin } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { createReactMessageI18nRuntime } from '@moluoxixi/plugin-i18n-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

export interface I18nFeatureState {
  plugin?: FormPlugin
  title: string
  description: string
  headerExtra?: React.ReactNode
}

export function useI18nFeature(sceneConfig: SceneConfig | null): I18nFeatureState {
  const i18nConfig = sceneConfig?.i18n
  const i18nRuntime = useMemo(() => {
    if (!i18nConfig) {
      return undefined
    }
    return createReactMessageI18nRuntime({
      messages: i18nConfig.messages,
      locale: i18nConfig.defaultLocale,
    })
  }, [i18nConfig])

  const [locale, setLocale] = useState('')
  useEffect(() => {
    if (!i18nRuntime) {
      setLocale('')
      return
    }
    setLocale(i18nRuntime.getLocale())
    return i18nRuntime.subscribeLocale(setLocale)
  }, [i18nRuntime])

  const localeOptions = useMemo(() => {
    if (!i18nConfig) {
      return []
    }
    if (sceneConfig?.localeOptions?.length) {
      return sceneConfig.localeOptions
    }
    return Object.keys(i18nConfig.messages).map(key => ({ label: key, value: key }))
  }, [i18nConfig, sceneConfig?.localeOptions])

  const translateText = useCallback((value: string): string => {
    if (!i18nRuntime || !value.startsWith('$t:')) {
      return value
    }
    return i18nRuntime.t(value.slice(3))
  }, [i18nRuntime, locale])

  const title = useMemo(() => {
    if (!sceneConfig) {
      return ''
    }
    return translateText(sceneConfig.title)
  }, [sceneConfig, translateText])

  const description = useMemo(() => {
    if (!sceneConfig) {
      return ''
    }
    return translateText(sceneConfig.description)
  }, [sceneConfig, translateText])

  const headerExtra = i18nRuntime && localeOptions.length > 0
    ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            语言：
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {localeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => void i18nRuntime.setLocale(opt.value)}
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
      )
    : undefined

  return {
    plugin: i18nRuntime?.plugin,
    title,
    description,
    headerExtra,
  }
}
