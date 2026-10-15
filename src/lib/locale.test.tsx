import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { directionOf, formatCurrency, LocaleProvider, useLocale } from './locale'

describe('directionOf', () => {
  it.each([
    ['en-US', 'ltr'],
    ['de-DE', 'ltr'],
    ['ja-JP', 'ltr'],
    ['ar-SA', 'rtl'],
    ['ar', 'rtl'],
    ['he-IL', 'rtl'],
    ['fa-IR', 'rtl'],
    ['AR-eg', 'rtl'],
  ])('%s is %s', (locale, dir) => {
    expect(directionOf(locale)).toBe(dir)
  })
})

describe('formatCurrency', () => {
  it('follows the locale', () => {
    expect(formatCurrency('en-US', 1234.5, 'USD')).toBe('$1,234.50')
    expect(formatCurrency('de-DE', 1234.5, 'EUR')).toMatch(/^1\.234,50\s€$/)
  })
})

describe('useLocale', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('lang')
    document.documentElement.removeAttribute('dir')
  })

  function read(provider?: { locale: string; dir?: 'ltr' | 'rtl' }) {
    let seen: ReturnType<typeof useLocale> | undefined
    function Probe() {
      seen = useLocale()
      return null
    }
    const root = createRoot(document.createElement('div'))
    act(() =>
      root.render(
        provider
          ? createElement(LocaleProvider, { ...provider, children: createElement(Probe) })
          : createElement(Probe),
      ),
    )
    act(() => root.unmount())
    return seen
  }

  it('defaults to en-US, left to right', () => {
    document.documentElement.removeAttribute('lang')
    expect(read()).toEqual({ locale: 'en-US', dir: 'ltr' })
  })

  it('reads the document language and direction without a provider', () => {
    document.documentElement.lang = 'he-IL'
    document.documentElement.dir = 'rtl'
    expect(read()).toEqual({ locale: 'he-IL', dir: 'rtl' })
  })

  it('a provider wins and derives the direction', () => {
    expect(read({ locale: 'ar-EG' })).toEqual({ locale: 'ar-EG', dir: 'rtl' })
    expect(read({ locale: 'de-DE', dir: 'rtl' })).toEqual({ locale: 'de-DE', dir: 'rtl' })
  })
})
