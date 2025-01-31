import React, { ReactNode } from 'react'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'
import { Text } from '@/components/dfds-ui/typography'
import { visuallyHidden } from '@/components/dfds-ui/react-components'
import { Minus, Yes } from '@/components/dfds-ui/icons/system'
import useCheckboxContext from './CheckboxContext'
import { Label } from '../label/Label'
import HelpIcon from '../help-icon/HelpIcon'

type CheckboxSize = 'medium' | 'small'

export type CheckboxProps = {
  /**
   * Field name.
   */
  name: string
  /**
   * Indicate that the checkbox is checked.
   *
   * Setting to either true or false will make this a controlled component.
   */
  checked?: boolean
  /**
   * Indicate that the checkbox is defaultChecked.
   */
  defaultChecked?: boolean
  /**
   * Class name to be assigned to the component.
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
   * Additional help.
   *
   * **This is an experimental prop and the behavior might change.**
   */
  // TODO: Change to React.ReactNode when no longer using the tooltip to show help
  help?: string
  /**
   * If true the checkbox will be rendered in indeterminate state (visual only).
   */
  indeterminate?: boolean
  /**
   * Size variant.
   */
  visualSize?: CheckboxSize
  /**
   * Controls the vertical alignment of the checkbox in relation to the label.
   */
  inputVerticalAlignment?: 'center' | 'top'
  /**
   * Callback when the checkbox is checked or unchecked.
   */
  onChange?: JSX.IntrinsicElements['input']['onChange']
  /**
   * Callback when the label (or checkbox control) is clicked.
   */
  onLabelClick?: JSX.IntrinsicElements['label']['onClick']

  children?: ReactNode
}

const checkbox = {
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
      size: theme.spacing.s,
      px2: `calc(${theme.spacing.s} - 4px)`,
      focus: `calc(${theme.spacing.m} - 2px)`,
    },
    medium: {
      size: theme.spacing.m,
      px2: theme.spacing.m,
      focus: `calc(${theme.spacing.l} - 2px)`,
    },
  },
}

const checkboxStyle = (size: CheckboxSize, inputVerticalAlignment: 'center' | 'top', disabled?: boolean) => css`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  & [data-checkbox-svg='yes'] {
    opacity: 0;
  }

  input {
    ${visuallyHidden()}

    &:checked + i {
      border-width: ${theme.borders.widths.m};

      & [data-checkbox-svg='yes'] {
        opacity: 1;
      }

      & [data-checkbox-svg='minus'] {
        opacity: 0;
      }
    }

    &:not(:disabled) {
      &:focus + i:after {
        opacity: 1;
      }

      [data-js-focus-visible] &:focus:not([data-focus-visible-added]) + i:after {
        opacity: 0;
      }
      /* Must be a separate rule or it will break IE11 */
      &:focus:not(:focus-visible) + i:after {
        opacity: 0;
      }

      &:focus + i,
      [data-js-focus-visible] &[data-focus-visible-added]:focus + i {
        border: ${theme.radii.m} solid ${checkbox.colors.secondaryMain};
      }
      /* Must be a separate rule or it will break IE11 */
      &:focus:focus-visible + i {
        border: ${theme.radii.m} solid ${checkbox.colors.secondaryMain};
      }

      [data-js-focus-visible] &:focus:not([data-focus-visible-added]):not(:hover):not(:checked) + i {
        border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.secondary};
      }
      /* Must be a separate rule or it will break IE11 */
      &:focus:not(:focus-visible):not(:hover):not(:checked) + i {
        border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.secondary};
      }

      &:hover + i {
        border: ${theme.borders.widths.m} solid ${checkbox.colors.secondaryDark};
        svg {
          color: ${checkbox.colors.secondaryDark};
        }
      }
    }

    &:not(:disabled):checked {
      + i {
        border-color: ${checkbox.colors.secondaryMain};
        background-color: ${checkbox.colors.secondaryMain};
      }

      &:hover + i {
        border-color: ${checkbox.colors.secondaryDark};
        background-color: ${checkbox.colors.secondaryDark};
        svg {
          color: ${theme.colors.surface.primary};
        }
        &:active + i:after {
          opacity: 0;
        }
      }
    }

    &:disabled {
      ~ p {
        color: ${checkbox.colors.textDarkDisabled};
        user-select: none;
      }
      &:not(:checked) + i {
        border-color: ${checkbox.colors.textDarkDisabled};
      }
      &:not(:checked) + i > svg {
        color: ${checkbox.colors.textDarkDisabled};
      }
      &:checked + i {
        border-color: transparent;
        background-color: ${checkbox.colors.textDarkDisabled};
      }
    }
  }

  i {
    display: block;
    border: ${theme.borders.widths.s} solid ${theme.colors.text.dark.secondary};
    border-radius: ${theme.radii.m};
    background-color: ${theme.colors.surface.primary};
    width: ${size === 'medium' ? checkbox.sizes.medium.size : checkbox.sizes.small.size};
    height: ${size === 'medium' ? checkbox.sizes.medium.size : checkbox.sizes.small.size};
    pointer-events: none;
    margin-right: ${theme.spacing.xs};
    flex-shrink: 0;
    position: relative;
    align-self: ${inputVerticalAlignment === 'top' ? 'flex-start' : 'center'};

    &:after {
      content: '';
      border-radius: ${theme.radii.m};
      opacity: 0;
      border: ${theme.borders.widths.m} solid ${checkbox.colors.textSecondaryPrimary};
      width: ${size === 'medium' ? checkbox.sizes.medium.focus : checkbox.sizes.small.focus};
      height: ${size === 'medium' ? checkbox.sizes.medium.focus : checkbox.sizes.small.focus};
      filter: drop-shadow(0px 0px 4px ${checkbox.colors.textSecondaryPrimary});
    }

    &:after,
    svg {
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
`

const errorCheckboxStyle = css`
  input:not(:disabled) {
    + i {
      border: ${theme.borders.widths.m} solid ${checkbox.colors.statusAlert};
    }
    + i > svg {
      color: ${checkbox.colors.statusAlert};
    }
    &:hover {
      + i {
        border-color: ${checkbox.colors.statusAlert};
        svg {
          color: ${checkbox.colors.statusAlert};
        }
      }
    }
    &:focus + i,
    [data-js-focus-visible] &[data-focus-visible-added]:focus + i {
      border: ${theme.radii.m} solid ${checkbox.colors.statusAlert};
    }
    /* Must be a separate rule or it will break IE11 */
    &:focus:focus-visible + i {
      border: ${theme.radii.m} solid ${checkbox.colors.statusAlert};
    }
    [data-js-focus-visible] &:focus:not([data-focus-visible-added]):not(:hover):not(:checked) + i {
      border: ${theme.radii.m} solid ${checkbox.colors.statusAlert};
    }
    /* Must be a separate rule or it will break IE11 */
    &:focus:not(:focus-visible):not(:hover):not(:checked) + i {
      border: ${theme.radii.m} solid ${checkbox.colors.statusAlert};
    }
  }

  input:not(:disabled):checked {
    + i {
      background-color: ${checkbox.colors.statusAlert};
      border: ${theme.borders.widths.m} solid ${checkbox.colors.statusAlert};
    }
    + i > svg {
      color: ${theme.colors.surface.primary};
    }
    &:hover {
      + i {
        border-color: ${checkbox.colors.statusAlert};
        background-color: ${checkbox.colors.statusAlert};
      }
    }
  }
`

const labelStyle = (disabled?: boolean) => css`
  color: ${disabled ? theme.colors.text.primary.disabled : checkbox.colors.textDarkPrimary};
`

const checkmarkStyle = (size: CheckboxSize) => css`
  color: ${theme.colors.surface.primary};
  font-size: ${size === 'medium' ? theme.spacing.m : theme.spacing.s};
`

const indeterminateStyle = (size: CheckboxSize) => css`
  color: ${theme.colors.text.dark.secondary};
  font-size: ${size === 'medium' ? theme.spacing.m : theme.spacing.s};
`

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      name,
      children,
      className,
      checked,
      defaultChecked,
      disabled,
      help,
      indeterminate,
      value,
      onChange,
      onLabelClick,
      error: errorProp = false,
      visualSize: visualSizeProp = 'medium',
      inputVerticalAlignment = 'center',
      ...rest
    },
    ref
  ) => {
    const ctx = useCheckboxContext()
    const visualSize = ctx !== undefined ? ctx.visualSize : visualSizeProp
    const error = ctx !== undefined ? ctx.error : errorProp

    return (
      <Label
        className={className}
        css={[checkboxStyle(visualSize, inputVerticalAlignment, disabled), error && errorCheckboxStyle]}
        visualSize={visualSize}
        onClick={onLabelClick}
        disabled={disabled}
      >
        <input
          type="checkbox"
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-invalid={error}
          value={value}
          onChange={onChange}
          ref={ref}
          {...rest}
        />
        <i>
          {indeterminate && <Minus data-checkbox-svg="minus" css={indeterminateStyle(visualSize)} focusable="false" />}
          <Yes data-checkbox-svg="yes" css={checkmarkStyle(visualSize)} focusable="false" />
        </i>
        <Text styledAs="bodyInterface" as="span" css={labelStyle(disabled)}>
          {children}
        </Text>
        {help && (
          <HelpIcon
            css={css`
              margin: 0 ${theme.spacing.xs};
            `}
            content={help}
          />
        )}
      </Label>
    )
  }
)

/** @deprecated Use Checkbox */
export const CheckboxField = Checkbox
