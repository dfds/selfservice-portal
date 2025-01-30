import { colors } from '@dfds-ui/colors'
import { spacing } from '@dfds-ui/spacing'

export const theme = {
  colors,
  fontFamily: 'DFDS, Verdana, system-ui, Arial, "Helvetica Neue", Helvetica, sans-serif',
  spacing,
  uiRoundness: '2px',
}

export type ThemeInterface = typeof theme

export default theme
