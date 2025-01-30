import React, { ReactNode } from 'react'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'
import { Label } from '../label/Label'
import { Text } from '@/components/dfds-ui/typography'
import { visuallyHidden } from '@dfds-ui/react-components'
import useRadioContext from './RadioContext'
import { onlyIE } from '@dfds-ui/react-components/common/utils'

type RadioSize = 'medium' | 'small'

export type RadioStyleState = 'checked'

export type RadioProps = {
  /**
   * Field name.
   */
  name: string
  /**
   * Indicate that the radio button is checked
   */
  checked?: boolean
  /**
   *
   */
  defaultChecked?: boolean
  /**
   * Field label.
   */
  label?: ReactNode
  /**
   * Class name to be assigned to the component
   */
  className?: string
  /**
   * Field label.
   */
  value?: string
  /**
   * Indicates that the radio button is disabled.
   */
  disabled?: boolean
  /**
   * Indicates an error in the field.
   */
  error?: boolean
  /**
   * Size variant.
   */
  visualSize?: RadioSize
  /**
   * Callback when the radio button is checked or unchecked
   */
  onChange?: JSX.IntrinsicElements['input']['onChange']

  Icon?: React.ComponentType

  styledAs?: RadioStyleState
}

const radio = {
  colors: {
    secondaryDark: theme.colors.secondary.dark,
    secondaryMain: theme.colors.secondary.main,
    statusAlert: theme.colors.status.alert,
    textSecondaryPrimary: theme.colors.text.secondary.primary,
    textDarkPrimary: theme.colors.text.dark.primary,
    textDarkDisabled: theme.colors.text.dark.disabled,
  },
  sizes: {
    small: {
      px1: `calc(${theme.spacing.s} - 2px)`,
      px2: `calc(${theme.spacing.s} - 4px)`,
      focus: `calc(${theme.spacing.m} - 4px)`,
    },
    medium: {
      px1: `calc(${theme.spacing.m} - 2px)`,
      px2: `calc(${theme.spacing.m} - 4px)`,
      focus: `calc(${theme.spacing.l} - 4px)`,
    },
  },
}

const checkedStyle = (size: RadioSize) => css`
  input {
    + i {
      border-width: ${theme.borders.widths.m};
      width: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
      height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};

      &:before {
        opacity: 1;
      }
    }

    &:not(:disabled) {
      + i {
        border-color: ${radio.colors.secondaryMain};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }

      &:hover + i {
        border-color: ${radio.colors.secondaryDark};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }

      &:hover + svg {
        color: ${theme.colors.secondary.dark};
      }

      &:active + i {
        border-color: ${radio.colors.secondaryMain};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }
      + svg {
        color: ${theme.colors.text.secondary.primary};
      }
    }
  }
`

const getOverridenStyle = (styledAs: RadioStyleState, size: RadioSize) => css`
  ${styledAs === 'checked' && checkedStyle(size)}
`

const radioStyle = (size: RadioSize, disabled?: boolean) => css`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  cursor: ${disabled ? 'not-allowed' : 'pointer'};

  input {
    ${visuallyHidden()}

    &:checked + i {
      border-width: ${theme.borders.widths.m};
      width: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
      height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};

      &:before {
        opacity: 1;
      }
    }

    &:not(:disabled) {
      &:hover + i {
        border: ${theme.borders.widths.m} solid ${radio.colors.secondaryDark};
        width: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
        height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
      }

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

      &:active + i {
        border: ${theme.borders.widths.m} solid ${radio.colors.secondaryMain};
        width: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
        height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
      }
    }

    &:not(:disabled) {
      &:hover + svg {
        color: ${theme.colors.text.dark.primary};
      }
    }

    &:not(:disabled):checked {
      + i {
        border-color: ${radio.colors.secondaryMain};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }

      &:hover + i {
        border-color: ${radio.colors.secondaryDark};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }

      &:active + i {
        border-color: ${radio.colors.secondaryMain};

        &:before {
          background-color: ${radio.colors.secondaryMain};
        }
      }
      :not(:hover) + svg {
        color: ${theme.colors.text.secondary.primary};
      }
      :hover + svg {
        color: ${theme.colors.secondary.dark};
      }
    }

    :focus-visible + svg {
      outline: 1px solid ${theme.colors.text.dark.disabled};
    }

    &:disabled {
      &:not(:checked) + i {
        border-color: ${radio.colors.textDarkDisabled};
      }
      &:checked + i {
        border-color: ${radio.colors.textDarkDisabled};

        &:before {
          background-color: ${radio.colors.textDarkDisabled};
        }
      }
      + svg {
        color: ${theme.colors.text.dark.disabled};
      }
    }
  }

  i {
    display: block;
    box-sizing: content-box;
    border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.secondary};
    width: ${size === 'medium' ? radio.sizes.medium.px1 : radio.sizes.small.px1};
    height: ${size === 'medium' ? radio.sizes.medium.px1 : radio.sizes.small.px1};
    border-radius: 100%;
    pointer-events: none;
    margin-right: ${theme.spacing.xs};
    flex-shrink: 0;
    position: relative;
    ${onlyIE`
      transform: translate(0px, -50%);
      top: 50%;
    `}

    &:before,
    &:after {
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
      width: ${size === 'medium' ? theme.spacing.s : theme.spacing.xs};
      height: ${size === 'medium' ? theme.spacing.s : theme.spacing.xs};
    }
    &:after {
      border: ${theme.borders.widths.m} solid ${radio.colors.textSecondaryPrimary};
      width: ${size === 'medium' ? radio.sizes.medium.focus : radio.sizes.small.focus};
      height: ${size === 'medium' ? radio.sizes.medium.focus : radio.sizes.small.focus};
      filter: drop-shadow(0px 0px 4px ${radio.colors.textSecondaryPrimary});
    }
  }
`

const errorRadioStyle = (size: RadioSize) => css`
  input:not(:disabled) {
    + i {
      border: ${theme.borders.widths.m} solid ${radio.colors.statusAlert};
      width: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
      height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};

      &:before {
        background-color: ${radio.colors.statusAlert};
      }
    }
    &:checked + i {
      border-color: ${radio.colors.statusAlert};

      &:before {
        background-color: ${radio.colors.statusAlert};
      }
    }
    &:hover {
      + i {
        border-color: ${radio.colors.statusAlert};
      }
      &:checked + i {
        border-color: ${radio.colors.statusAlert};
        &:before {
          background-color: ${radio.colors.statusAlert};
        }
      }
    }
  }
`

const labelStyle = (disabled: boolean | undefined, size: RadioSize) => css`
  color: ${disabled ? theme.colors.text.primary.disabled : radio.colors.textDarkPrimary};

  /* If no label is given we still need a size for it to trigger the associated behaviours */
  min-height: ${size === 'medium' ? radio.sizes.medium.px2 : radio.sizes.small.px2};
  min-width: 1px;
`

const iconSizeCss = (visualSize: RadioSize) => radio.sizes[visualSize].px1

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      name,
      label,
      className,
      checked,
      disabled,
      defaultChecked,
      value,
      onChange,
      error: errorProp = false,
      visualSize: visualSizeProp = 'medium',
      Icon,
      styledAs,
      ...rest
    },
    ref
  ) => {
    const ctx = useRadioContext()

    const visualSize = ctx !== undefined ? ctx.visualSize : visualSizeProp
    const error = ctx !== undefined ? ctx.error : errorProp
    return (
      <Label
        className={className}
        css={[
          radioStyle(visualSize, disabled),
          error && errorRadioStyle(visualSize),
          styledAs && getOverridenStyle(styledAs, visualSize),
        ]}
        visualSize={visualSize}
        disabled={disabled}
      >
        <input
          type="radio"
          defaultChecked={defaultChecked}
          name={name}
          checked={checked}
          disabled={disabled}
          aria-invalid={error}
          value={value}
          onChange={onChange}
          ref={ref}
          {...rest}
        />
        {Icon ? (
          <Icon
            css={css`
              width: ${iconSizeCss(visualSize)};
              height: ${iconSizeCss(visualSize)};
              color: ${theme.colors.text.dark.secondary};
            `}
          />
        ) : (
          <i />
        )}
        <Text styledAs="bodyInterface" as="span" css={labelStyle(disabled, visualSize)}>
          {label}
        </Text>
      </Label>
    )
  }
)

/** @deprecated Use Radio */
export const RadioField = Radio
