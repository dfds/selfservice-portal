export const fontFamilies = {
  display: 'DFDS, Verdana, system-ui, Arial, "Helvetica Neue", Helvetica, sans-serif',
  body: 'Verdana, system-ui, Arial, "Helvetica Neue", Helvetica, sans-serif',
  system:
    '-apple-system, system-ui, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
}

export const fontSizes = {
  headline: {
    hero: {
      mobile: '32px',
      desktop: '48px',
    },
    section: '28px',
    sub: '24px',
    small: '20px',
  },
  action: '16px',
  label: {
    small: '12px',
    medium: '16px',
  },
  body: {
    small: '12px',
    medium: '14px',
  },
  caption: '10px',
}

export const lineHeights = {
  headline: {
    hero: {
      mobile: 1.25,
      desktop: 1.167,
    },
    section: 1.286,
    sub: 1.334,
    small: 1.4,
  },
  action: 1,
  body: {
    small: 1.334,
    regular: 1.715,
    interface: 1.429,
  },
  label: {
    small: 1.334,
    medium: 1.25,
  },

  caption: 1.6,
}

export const fontWeights = {
  display: {
    light: 300,
    regular: 400,
    bold: 700,
  },
  body: {
    regular: 400,
    bold: 700,
  },
}

const fonts = {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
}

export default fonts
