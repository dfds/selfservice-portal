import { hydro2 } from '@/components/dfds-ui/colors'
import { css } from '@emotion/react'
import theme from './theme'

const outline = (error = false) => css`
  outline: none;

  &:focus {
    outline: none;
  }

  &:before {
    box-sizing: border-box;
    content: '';
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    background: transparent;
    border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.secondary};
  }

  &:not([disabled]) {
    &:hover {
      &:before {
        border: ${theme.borders.widths.m} solid ${theme.colors.secondary.dark};
      }
    }

    &:focus {
      &[data-focus-visible-added] {
        &:before {
          border: ${theme.borders.widths.m} solid ${theme.colors.secondary.main};
          box-shadow: 0 0 4px ${theme.colors.secondary.main};
        }
      }
    }

    &:active {
      &:before {
        border: ${theme.borders.widths.m} solid ${theme.colors.secondary.main};
      }
    }
  }

  ${error &&
  css`
    &:before {
      border: ${theme.borders.widths.m} solid ${theme.colors.status.alert};
    }
  `}

  &[disabled] {
    &:before {
      border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.disabled};
    }
  }
`

export type OverlayOptions = typeof defaultOverlayOptions

const defaultOverlayOptions = {
  hover: '0.08',
  focus: '0.16',
  active: '0.16',
  selected: '0.12',
  disabled: '0.3',
  color: 'currentColor',
  ignoreFocusVisibility: false,
}

const lightBlueOverlayOptions: OverlayOptions = {
  hover: '0.08',
  focus: '0.16',
  active: '0.16',
  selected: '0.12',
  disabled: '0.3',
  color: hydro2.secondary.main,
  ignoreFocusVisibility: false,
}

const overlay = (selected = false, overlayOptions: Partial<typeof defaultOverlayOptions> = {}) => {
  const options = {
    ...defaultOverlayOptions,
    ...overlayOptions,
  }

  return css`
    outline: none;

    &:focus {
      outline: none;
    }

    &:after {
      content: '';
      display: block;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      position: absolute;
      background: ${options.color};
      opacity: 0;
    }

    &:hover {
      &:after {
        opacity: ${options.hover};
      }
    }

    &:focus {
      ${options.ignoreFocusVisibility
        ? css`
            &:after {
              opacity: ${options.focus};
            }
          `
        : css`
            &[data-focus-visible-added] {
              &:after {
                opacity: ${options.focus};
              }
            }
          `}
    }

    &:active {
      &:after {
        opacity: ${options.active};
      }
    }

    &[disabled] {
      opacity: ${options.disabled};

      &:after {
        visibility: hidden;
      }
    }

    ${selected &&
    css`
      &:after {
        opacity: ${options.selected};
      }
    `}
  `
}

export default {
  outline,
  overlay,
  overlayOptions: {
    defaultOverlayOptions,
    lightBlueOverlayOptions,
  },
}
