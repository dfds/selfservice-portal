import React from 'react'
import { theme } from '@/components/dfds-ui/theme'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { visuallyHidden } from '../../styles'

export const radioSizes = {
  small: {
    circle: '16px',
    mark: '8px',
    outline: '24px',
    fontSize: '14px',
    lineHeight: '14px',
    paddingLeft: '26px',
  },
  medium: {
    circle: '24px',
    mark: '14px',
    outline: '32px',
    fontSize: '16px',
    lineHeight: '20px',
    paddingLeft: '34px',
  },
}

export type BaseProps = Omit<JSX.IntrinsicElements['input'], 'size' | 'css'> & { htmlSize?: number }

export type Size = keyof typeof radioSizes

export type RadioProps = BaseProps & {
  className?: string
  error?: boolean
  name: string
  value: string
  onChange?: any
  disabled?: boolean
  checked?: boolean
  size?: Size
}

const Label = styled.label<{ hasError?: boolean; size: Size; disabled?: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  border: ${theme.colors.text.dark.secondary};
  cursor: pointer;

  &:not(:last-of-type) {
    margin-bottom: ${theme.spacing.xs};
  }

  input {
    ${visuallyHidden()}

    /* Increase border width and adjust the cicles to it */
    &:checked + i {
      border-width: 2px;

      &:before {
        opacity: 1;
      }
    }

    /* Default state */
    &:not(:disabled) {
      &:hover + i {
        border-width: 2px;
        border-color: ${theme.colors.secondary.dark};
      }

      &:focus {
        &:focus {
          + i:after {
            opacity: 1;
          }
        }
        [data-js-focus-visible] &:focus:not([data-focus-visible-added]) {
          + i:after {
            opacity: 0;
          }
        }
        /* Must be a separate rule or it will break IE11 */
        &:focus:not(:focus-visible) {
          + i:after {
            opacity: 0;
          }
        }
      }

      &:active + i {
        border-width: 2px;
        border-color: ${theme.colors.secondary.main};
      }
    }

    /* Checked */
    &:not(:disabled):checked {
      + i {
        border-color: ${theme.colors.secondary.main};

        &:before {
          background-color: ${theme.colors.secondary.main};
        }
      }

      &:hover + i {
        border-color: ${theme.colors.secondary.dark};

        &:before {
          background-color: ${theme.colors.secondary.dark};
        }
      }

      &:active + i {
        border-color: ${theme.colors.secondary.main};

        &:before {
          background-color: ${theme.colors.secondary.main};
        }
      }
    }

    /* Disabled */
    &:disabled {
      ~ span {
        color: ${theme.colors.text.dark.secondary};
        user-select: none;
      }

      &:not(:checked) + i {
        border-color: ${theme.colors.text.dark.disabled};
      }
      &:checked + i {
        border-color: ${theme.colors.text.dark.disabled};

        &:before {
          background-color: ${theme.colors.text.dark.disabled};
        }
      }
    }
  }

  i {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    border: 1px solid ${theme.colors.text.dark.secondary};
    width: ${(p) => radioSizes[p.size].circle};
    height: ${(p) => radioSizes[p.size].circle};
    border-radius: 100%;
    pointer-events: none;
    flex-shrink: 0;

    &:before,
    &:after,
    svg {
      display: block;
      position: absolute;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
    }

    &:before,
    &:after {
      content: '';
      border-radius: 100%;
      opacity: 0;
    }
    &:before {
      width: ${(p) => radioSizes[p.size].mark};
      height: ${(p) => radioSizes[p.size].mark};
    }
    &:after {
      width: ${(p) => radioSizes[p.size].outline};
      height: ${(p) => radioSizes[p.size].outline};
      border: 2px solid ${theme.colors.secondary.main};
      box-shadow: 0 0 4px 0 ${theme.colors.secondary.main};
    }
  }

  ${(p) =>
    p.hasError &&
    css`
      input:not(:disabled) {
        + i {
          border-width: 2px;
          border-color: ${theme.colors.status.alert};

          &:before {
            background-color: ${theme.colors.status.alert};
          }
        }
        &:checked + i {
          border-color: ${theme.colors.status.alert};

          &:before {
            background-color: ${theme.colors.status.alert};
          }
        }
        &:hover {
          + i {
            /* #981824 = darken(theme.colors.status.alert, 20%) */
            border-color: #981824;
          }

          &:checked + i {
            border-color: #981824;

            &:before {
              background-color: #981824;
            }
          }
        }
      }
    `};

  ${(p) =>
    p.disabled &&
    css`
      cursor: not-allowed;
    `}
`

const Text = styled.span<{ size: Size }>`
  flex: 0 1 auto;
  padding: 2px 0 2px ${(p) => radioSizes[p.size].paddingLeft};
  font-size: ${(p) => radioSizes[p.size].fontSize};
  line-height: ${(p) => radioSizes[p.size].lineHeight};
  user-select: none;
  pointer-events: none;
`

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ children, disabled, checked, className, error, onChange, htmlSize, size = 'medium', ...rest }, ref) => (
    <Label hasError={error} disabled={disabled} size={size} className={`${className}`}>
      <input
        type="radio"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        readOnly={!onChange}
        aria-invalid={error}
        size={htmlSize}
        ref={ref}
        {...rest}
      />
      <i />
      <Text size={size}>{children}</Text>
    </Label>
  )
)

export default Radio
