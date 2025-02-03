import fonts from './fonts'
import borders from './borders'
import radii from './radii'
import elevation from './elevation'
import { Colors, hydro2, legacyColorPalette } from '@/dfds-ui/colors/src'
import { LegacyColorsFlat } from '@/dfds-ui/colors/src/legacy'
import { spacing } from '@/dfds-ui/spacing/src'
import states from './states'
import breakpoints from './breakpoints'
import zIndex from './z-index'

// eslint-disable-next-line deprecation/deprecation
const themeColors: Colors & LegacyColorsFlat = {
  ...hydro2,
  // eslint-disable-next-line deprecation/deprecation
  ...legacyColorPalette.surface,
  // eslint-disable-next-line deprecation/deprecation
  ...legacyColorPalette.static,
  // eslint-disable-next-line deprecation/deprecation
  ...legacyColorPalette.interaction,
  // eslint-disable-next-line deprecation/deprecation
  ...legacyColorPalette.status,
}

const theme = {
  ...fonts,
  borders,
  colors: themeColors,
  spacing,
  radii,
  elevation,
  breakpoints,
  states,
  zIndex,
}

export default theme
