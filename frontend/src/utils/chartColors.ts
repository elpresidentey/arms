/**
 * Shared chart palette — mirrors the ARMS design-system tokens (primary green,
 * emerald success, amber warning, rose error, slate neutrals) so every chart
 * stays on-palette.
 */

export const CHART_COLORS = {
  primary: '#3d5a36',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  slate: '#334155',
  slateTint: '#e2e8f0',
  tick: '#64748b',
  cursor: '#cbd5e1',
}

export const GRID_STYLE = { stroke: CHART_COLORS.slateTint, strokeDasharray: '3 3' }
export const TICK_STYLE = { fill: CHART_COLORS.tick, fontSize: 12 }

export default CHART_COLORS