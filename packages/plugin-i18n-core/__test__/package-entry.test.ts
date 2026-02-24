import { describe, expect, it, vi } from 'vitest'
import { i18nPlugin, translateSchema } from '../src/index.ts'

describe('plugin-i18n-core', () => {
  it('translates schema i18n keys', () => {
    const schema = {
      title: '$t:form.title',
      componentProps: { placeholder: '$t:form.placeholder' },
      decoratorProps: {
        actions: {
          submit: '$t:actions.submit',
        },
      },
      enum: [{ label: '$t:yes', value: true }],
      properties: {
        name: { title: '$t:user.name' },
      },
    }

    const translated = translateSchema(schema, {
      t: key => 'translated:' + key,
    })

    expect(translated.title).toBe('translated:form.title')
    expect(translated.componentProps?.placeholder).toBe('translated:form.placeholder')
    expect((translated.decoratorProps as any).actions.submit).toBe('translated:actions.submit')
    expect(translated.enum?.[0]).toEqual({ label: 'translated:yes', value: true })
    expect(translated.properties?.name.title).toBe('translated:user.name')
  })

  it('updates locale and notifies subscribers', async () => {
    const changeLocale = vi.fn(async () => {})
    const installed = i18nPlugin({
      locale: 'en',
      t: key => key,
      changeLocale,
    }).install({})

    const listener = vi.fn()
    const unsubscribe = installed.api.subscribe(listener)

    await installed.api.setLocale('zh')

    expect(changeLocale).toHaveBeenCalledWith('zh')
    expect(installed.api.version).toBe(1)
    expect(listener).toHaveBeenCalledWith(1)

    unsubscribe()
  })

  it('reacts to external locale changes and cleans listeners on dispose', () => {
    let onLocaleChangeListener: ((locale: string) => void) | undefined
    const stop = vi.fn()
    const installed = i18nPlugin({
      locale: 'en',
      t: key => key,
      onLocaleChange(listener) {
        onLocaleChangeListener = listener
        return stop
      },
    }).install({})

    const listener = vi.fn()
    installed.api.subscribe(listener)

    onLocaleChangeListener?.('fr')

    expect(installed.api.getLocale()).toBe('fr')
    expect(installed.api.version).toBe(1)
    expect(listener).toHaveBeenCalledWith(1)

    installed.dispose?.()
    expect(stop).toHaveBeenCalledTimes(1)
  })
})
