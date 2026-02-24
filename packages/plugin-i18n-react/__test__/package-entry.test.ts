import { describe, expect, it, vi } from 'vitest'
import { createReactMessageI18nRuntime } from '../src/index.ts'

describe('plugin-i18n-react runtime', () => {
  it('translates messages and switches locale', async () => {
    const runtime = createReactMessageI18nRuntime({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        zh: { hello: 'Nihao' },
      },
    })

    expect(runtime.t('hello')).toBe('Hello')

    await runtime.setLocale('zh')

    expect(runtime.getLocale()).toContain('zh')
    expect(runtime.t('hello')).toBe('Nihao')
  })

  it('bridges runtime locale changes with installed plugin api', async () => {
    const runtime = createReactMessageI18nRuntime({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        zh: { hello: 'Nihao' },
      },
    })

    const localeListener = vi.fn()
    const unsubscribe = runtime.subscribeLocale(localeListener)
    const installed = runtime.plugin.install({} as any)

    await runtime.setLocale('zh')

    expect(installed.api.getLocale()).toContain('zh')
    expect(localeListener).toHaveBeenCalled()

    unsubscribe()
    installed.dispose?.()
  })
})
