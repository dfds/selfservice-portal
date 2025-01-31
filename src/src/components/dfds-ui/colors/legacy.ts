/* eslint-disable deprecation/deprecation */
import { hydro2 } from './hydro2'

const { surface, primary, secondary, tertiary, text, status } = hydro2

/** @deprecated */
export interface LegacyColors {
  surface: {
    /** @deprecated use surface.secondary */
    backgroundGrey: string
    /** @deprecated use surface.primary */
    white: string
    /** @deprecated use surface.secondary*/
    whiteHover: string
  }
  static: {
    /** @deprecated use text.dark.primary */
    textGrey: string
    /** @deprecated use text.dark.secondary */
    textMedium: string
    /** @deprecated use text.dark.disabled */
    textLight: string
    /** @deprecated use primary.main */
    groupBlue: string
    /** @deprecated */
    groupMedium: string
    /** @deprecated use primary.light */
    groupLight: string
  }
  interaction: {
    /** @deprecated use secondary.main */
    linkBlue: string
    /** @deprecated use secondary.dark */
    linkHover: string
    /** @deprecated use secondary.main */
    actionBlue: string
    /** @deprecated use secondary.dark */
    actionHover: string
    /** @deprecated use secondary.light */
    actionMedium: string
    /** @deprecated use secondary.light */
    actionLight: string
    /** @deprecated use tertiary.main */
    primaryOrange: string
    /** @deprecated use tertiary.dark */
    primaryHover: string
    /** @deprecated use text.dark.secondary */
    uiEnabled: string
    /** @deprecated use text.dark.disabled */
    uiDisabled: string
  }
  status: {
    /** @deprecated use status.success */
    yesGreen: string
    /** @deprecated use status.warning */
    cautionAmber: string
    /** @deprecated use status.alert */
    noRed: string
  }
}

/** @deprecated */
export interface LegacyColorsFlat {
  /** @deprecated use surface.secondary */
  backgroundGrey: string
  /** @deprecated use surface.primary */
  white: string
  /** @deprecated use surface.secondary*/
  whiteHover: string
  /** @deprecated use text.dark.primary */
  textGrey: string
  /** @deprecated use text.dark.secondary */
  textMedium: string
  /** @deprecated use text.dark.disabled */
  textLight: string
  /** @deprecated use primary.main */
  groupBlue: string
  /** @deprecated */
  groupMedium: string
  /** @deprecated use primary.light */
  groupLight: string
  /** @deprecated use secondary.main */
  linkBlue: string
  /** @deprecated use secondary.dark */
  linkHover: string
  /** @deprecated use secondary.main */
  actionBlue: string
  /** @deprecated use secondary.dark */
  actionHover: string
  /** @deprecated use secondary.light */
  actionMedium: string
  /** @deprecated use secondary.light */
  actionLight: string
  /** @deprecated use tertiary.main */
  primaryOrange: string
  /** @deprecated use tertiary.dark */
  primaryHover: string
  /** @deprecated use text.dark.secondary */
  uiEnabled: string
  /** @deprecated use text.dark.disabled */
  uiDisabled: string
  /** @deprecated use status.success */
  yesGreen: string
  /** @deprecated use status.warning */
  cautionAmber: string
  /** @deprecated use status.alert */
  noRed: string
}

/** @deprecated */
export const legacyColorPalette: LegacyColors = {
  surface: {
    backgroundGrey: surface.secondary, // backgroundGrey.primary
    white: surface.primary, // white.primary
    whiteHover: surface.secondary, // backgroundGrey.hover
  },
  static: {
    textGrey: text.dark.primary, // textGrey.primary
    textMedium: text.dark.secondary, // textGrey.medium
    textLight: text.dark.disabled, // textGrey.light
    groupBlue: primary.main, // groupBlue.primary
    groupMedium: primary.light, // groupBlue.medium
    groupLight: primary.light, // groupBlue.light
  },
  interaction: {
    linkBlue: secondary.main, // linkBlue.primary
    linkHover: secondary.dark, // actionBlue.hover
    actionBlue: secondary.main, // actionBlue.primary
    actionHover: secondary.dark, // actionBlue.hover
    actionMedium: secondary.light, // actionBlue.medium
    actionLight: secondary.light,
    primaryOrange: tertiary.main, // primaryOrange.primary
    primaryHover: tertiary.dark, // primaryOrange.hover
    uiEnabled: text.dark.secondary,
    uiDisabled: text.dark.disabled,
  },
  status: {
    yesGreen: status.success, // new green
    cautionAmber: status.warning, // new yellow
    noRed: status.alert, // noRed.primary
  },
}

/** @deprecated */
export const legacyColors = {
  ...legacyColorPalette.surface,
  ...legacyColorPalette.static,
  ...legacyColorPalette.interaction,
  ...legacyColorPalette.status,
}
