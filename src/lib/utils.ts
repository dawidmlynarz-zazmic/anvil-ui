import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Figma text styles are `type-*` utilities (font size, line height, weight, tracking in one), so
// a later `type-*` replaces an earlier one, and it replaces the single-property text utilities.
const twMerge = extendTailwindMerge<'type-style'>({
  extend: {
    classGroups: { 'type-style': [{ type: [(value: string) => value.length > 0] }] },
    conflictingClassGroups: {
      'type-style': ['font-size', 'leading', 'font-weight', 'tracking'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
