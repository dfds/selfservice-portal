import { Colors } from '.'

export const hydro2: Colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#eef0f1',
    tertiary: '#002b45',
    main: '#FFFFFF',
    dark: '#eef0f1',
    inverted: '#002b45',
  },
  primary: {
    light: '#345370',
    main: '#002b45',
    dark: '#00001e',
  },
  secondary: {
    light: '#bbddf3',
    main: '#49a2df',
    dark: '#1874bc',
  },
  tertiary: {
    main: '#ED8800', //TODO: Added this to not reference the status.warning color for Button color
    dark: '#e16900',
  },
  status: {
    info: '#002b45',
    infomuted: '#bbddf3',
    success: '#4caf50',
    successmuted: '#B8E0B9',
    warning: '#ED8800',
    warningmuted: '#FFD399',
    alert: '#be1e2d',
    alertmuted: '#F1A7AE',
  },
  text: {
    dark: {
      primary: '#4d4e4c',
      secondary: '#4d4e4cb3',
      disabled: '#4d4e4c4d',
    },
    primary: {
      primary: '#002b45',
      secondary: '#002b45b3',
      disabled: '#002b454d',
    },
    secondary: {
      primary: '#49a2df',
      secondary: '#49a2dfb3',
      disabled: '#49a2df4d',
    },
    light: {
      primary: '#ffffff',
      secondary: '#ffffffb3',
      disabled: '#ffffff4d',
    },
  },
  divider: {
    light: '#ffffff29',
    dark: '#4d4e4c29',
  },
}

export default hydro2
