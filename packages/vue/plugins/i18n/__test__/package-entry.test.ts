import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createVueMessageI18nRuntime } from '../src/index.ts'

describe('plugin-i18n-vue runtime', () => {
  it('translates messages and switches locale', async () => {
    const runtime = createVueMessageI18nRuntime({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        zh: { hello: 'Nihao' },
      },
    })

    expect(runtime.t('hello')).toBe('Hello')

    runtime.setLocale('zh')
    await nextTick()

    expect(runtime.getLocale()).toBe('zh')
    expect(runtime.t('hello')).toBe('Nihao')
  })

  it('bridges runtime locale changes with installed plugin api', async () => {
    const runtime = createVueMessageI18nRuntime({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        zh: { hello: 'Nihao' },
      },
    })

    const localeListener = vi.fn()
    const unsubscribe = runtime.subscribeLocale(localeListener)
    const installed = runtime.plugin.install({} as any)

    runtime.setLocale('zh')
    await nextTick()
    await Promise.resolve()

    expect(installed.api.getLocale()).toBe('zh')
    expect(localeListener).toHaveBeenCalledWith('zh')

    unsubscribe()
    installed.dispose?.()
  })
})
