import { hydro2 } from './hydro2'
import { legacyColorPalette, legacyColors } from './legacy'

export interface Colors {
  surface: {
    /**  Hydro: #FFFFFF */
    primary: string

    /**  Hydro: #eef0f1 */
    secondary: string

    /**  Hydro: #002b45 */
    tertiary: string
    /** @deprecated use surface.primary */
    main: string
    /** @deprecated use surface.secondary */
    dark: string
    /** @deprecated use surface.tertiary */
    inverted: string
  }
  primary: {
    /**  Hydro: #345370 */
    light: string
    /**  Hydro: #002b45 */
    main: string
    /**  Hydro: #00001e */
    dark: string
  }
  secondary: {
    /**  Hydro: #bbddf3 */
    light: string
    /**  Hydro: #49a2df */
    main: string
    /**  Hydro: #1874bc */
    dark: string
  }
  tertiary: {
    /**  Hydro: #ED8800 */
    main: string
    /**  Hydro: #e16900 */
    dark: string
  }
  status: {
    /**  Hydro: #002b45 */
    info: string
    /**  Hydro: #bbddf3 */
    infomuted: string
    /**  Hydro: #4caf50 */
    success: string
    /**  Hydro: #B8E0B9 */
    successmuted: string
    /**  Hydro: #ED8800 */
    warning: string
    /**  Hydro: #FFD399 */
    warningmuted: string
    /**  Hydro: #be1e2d */
    alert: string
    /**  Hydro: #F1A7AE */
    alertmuted: string
  }
  text: {
    dark: {
      /**  Hydro: #4d4e4c */
      primary: string
      /**  Hydro: #4d4e4cb3 */
      secondary: string
      /**  Hydro: #4d4e4c4d */
      disabled: string
    }
    primary: {
      /**  Hydro: #002b45 */
      primary: string
      /**  Hydro: #002b45b3 */
      secondary: string
      /**  Hydro: #002b454d */
      disabled: string
    }
    secondary: {
      /**  Hydro: #49a2df */
      primary: string
      /**  Hydro: #49a2dfb3 */
      secondary: string
      /**  Hydro: #49a2df4d */
      disabled: string
    }
    light: {
      /**  Hydro: #ffffff */
      primary: string
      /**  Hydro: #ffffffb3 */
      secondary: string
      /**  Hydro: #ffffff4d */
      disabled: string
    }
  }
  divider: {
    /**  Hydro: #ffffff29 */
    light: string
    /**  Hydro: #4d4e4c29 */
    dark: string
  }
}

export type ColorPalette = Colors

export { hydro2 }

// Legacy exports
// eslint-disable-next-line deprecation/deprecation
export { legacyColorPalette, legacyColors, legacyColors as colors, legacyColorPalette as colorPalette }
