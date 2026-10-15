import * as React from 'react'

// Locale and text direction for components that format numbers, dates and money. Strings stay props (the
// caller translates them); what a component formats itself (a currency total, a month name, a weekday) uses
// this, so it follows the page language and not a hard-coded `en-US`. Without a provider the locale is the
// document's `lang` (falling back to `en-US`) and the direction is the document's `dir`.
//
// <LocaleProvider locale="ar-EG"> … </LocaleProvider>   // sets nothing on <html>: do that in your app shell
// const { locale, dir } = useLocale()

const RTL = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv'])

/** `ar-EG` → rtl, `de-DE` → ltr. */
function directionOf(locale: string): 'ltr' | 'rtl' {
  return RTL.has(locale.split('-')[0].toLowerCase()) ? 'rtl' : 'ltr'
}

type LocaleValue = { locale: string; dir: 'ltr' | 'rtl' }

const LocaleContext = React.createContext<LocaleValue | null>(null)

function LocaleProvider({
  locale,
  dir,
  children,
}: {
  locale: string
  dir?: 'ltr' | 'rtl'
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ locale, dir: dir ?? directionOf(locale) }), [locale, dir])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

function useLocale(): LocaleValue {
  const context = React.useContext(LocaleContext)
  if (context) return context
  const locale = (typeof document !== 'undefined' && document.documentElement.lang) || 'en-US'
  const dir =
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'rtl' : directionOf(locale)
  return { locale, dir }
}

function formatCurrency(locale: string, amount: number, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export { LocaleProvider, useLocale, formatCurrency, directionOf }
