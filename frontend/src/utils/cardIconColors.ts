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
  { container: string; hover: string }
> = {
  forest: {
    container:
      'bg-primary-50 text-primary-700 border-primary-100',
    hover: 'group-hover:bg-primary-100',
  },
  teal: {
    container: 'bg-teal-50 text-teal-700 border-teal-100',
    hover: 'group-hover:bg-teal-100',
  },
  sky: {
    container: 'bg-sky-50 text-sky-700 border-sky-100',
    hover: 'group-hover:bg-sky-100',
  },
  indigo: {
    container:
      'bg-indigo-50 text-indigo-700 border-indigo-100',
    hover: 'group-hover:bg-indigo-100',
  },
  violet: {
    container:
      'bg-violet-50 text-violet-700 border-violet-100',
    hover: 'group-hover:bg-violet-100',
  },
  amber: {
    container:
      'bg-amber-50 text-amber-800 border-amber-100',
    hover: 'group-hover:bg-amber-100',
  },
  orange: {
    container:
      'bg-orange-50 text-orange-700 border-orange-100',
    hover: 'group-hover:bg-orange-100',
  },
  rose: {
    container: 'bg-rose-50 text-rose-700 border-rose-100',
    hover: 'group-hover:bg-rose-100',
  },
  emerald: {
    container:
      'bg-emerald-50 text-emerald-700 border-emerald-100',
    hover: 'group-hover:bg-emerald-100',
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
