import { colors } from '@/dfds-ui/colors/src'
import { spacing } from '@/dfds-ui/spacing/src'

export const theme = {
  colors,
  fontFamily: 'DFDS, Verdana, system-ui, Arial, "Helvetica Neue", Helvetica, sans-serif',
  spacing,
  uiRoundness: '2px',
}

export type ThemeInterface = typeof theme

export default theme
