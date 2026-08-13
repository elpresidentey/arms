export type CardIconAccent =
  | 'forest'
  | 'teal'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'emerald'

/** Icon container styles — distinct, colorful accents per card */
export const CARD_ICON_ACCENTS: Record<
  CardIconAccent,
  { container: string; hover: string; bar: string }
> = {
  forest: {
    container:
      'bg-gradient-to-br from-primary-50 to-primary-100/70 text-primary-700 border-primary-100',
    hover: 'group-hover:from-primary-100 group-hover:to-primary-200/60',
    bar: 'from-primary-400 via-primary-500 to-primary-700',
  },
  teal: {
    container: 'bg-gradient-to-br from-teal-50 to-teal-100/70 text-teal-700 border-teal-100',
    hover: 'group-hover:from-teal-100 group-hover:to-teal-200/60',
    bar: 'from-teal-300 via-teal-400 to-teal-600',
  },
  sky: {
    container: 'bg-gradient-to-br from-sky-50 to-sky-100/70 text-sky-700 border-sky-100',
    hover: 'group-hover:from-sky-100 group-hover:to-sky-200/60',
    bar: 'from-sky-300 via-sky-400 to-sky-600',
  },
  indigo: {
    container:
      'bg-gradient-to-br from-indigo-50 to-indigo-100/70 text-indigo-700 border-indigo-100',
    hover: 'group-hover:from-indigo-100 group-hover:to-indigo-200/60',
    bar: 'from-indigo-300 via-indigo-400 to-indigo-600',
  },
  violet: {
    container:
      'bg-gradient-to-br from-violet-50 to-violet-100/70 text-violet-700 border-violet-100',
    hover: 'group-hover:from-violet-100 group-hover:to-violet-200/60',
    bar: 'from-violet-300 via-violet-400 to-violet-600',
  },
  amber: {
    container:
      'bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-800 border-amber-100',
    hover: 'group-hover:from-amber-100 group-hover:to-amber-200/60',
    bar: 'from-amber-300 via-amber-400 to-amber-600',
  },
  orange: {
    container:
      'bg-gradient-to-br from-orange-50 to-orange-100/70 text-orange-700 border-orange-100',
    hover: 'group-hover:from-orange-100 group-hover:to-orange-200/60',
    bar: 'from-orange-300 via-orange-400 to-orange-600',
  },
  rose: {
    container: 'bg-gradient-to-br from-rose-50 to-rose-100/70 text-rose-700 border-rose-100',
    hover: 'group-hover:from-rose-100 group-hover:to-rose-200/60',
    bar: 'from-rose-300 via-rose-400 to-rose-600',
  },
  emerald: {
    container:
      'bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-700 border-emerald-100',
    hover: 'group-hover:from-emerald-100 group-hover:to-emerald-200/60',
    bar: 'from-emerald-300 via-emerald-400 to-emerald-600',
  },
}

/** Map legacy StatsCard color names to accents */
export const legacyStatsCardColorMap: Record<string, CardIconAccent> = {
  primary: 'forest',
  green: 'teal',
  purple: 'violet',
  orange: 'amber',
  red: 'rose',
  blue: 'sky',
  teal: 'teal',
  violet: 'violet',
  amber: 'amber',
  rose: 'rose',
  emerald: 'emerald',
  indigo: 'indigo',
}

export const resolveCardAccent = (
  color: CardIconAccent | keyof typeof legacyStatsCardColorMap,
): CardIconAccent => {
  if (color in CARD_ICON_ACCENTS) {
    return color as CardIconAccent
  }
  return legacyStatsCardColorMap[color] ?? 'forest'
}
