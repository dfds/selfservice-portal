import React from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Yes } from '@/components/dfds-ui/icons/system'
import { Minus } from '@/components/dfds-ui/icons/system'
import { theme } from '@/components/dfds-ui/theme'
import { Text } from '@/components/dfds-ui/typography'
import { visuallyHidden } from '../../styles'

const checkboxSizes = {
  small: {
    checkbox: '16px',
    outline: '24px',
    tick: '12px',
    fontSize: '14px',
    lineHeight: '18px',
    paddingLeft: '26px',
  },
  medium: {
    checkbox: '24px',
    outline: '32px',
    fontSize: '16px',
    lineHeight: '20px',
    tick: '16px',
    paddingLeft: '34px',
  },
}

type Size = keyof typeof checkboxSizes

type BaseProps = Omit<JSX.IntrinsicElements['input'], 'size' | 'css'> & { htmlSize?: number }

export type CheckboxProps = BaseProps & {
  className?: string
  error?: boolean
  name?: string
  value?: string
  onChange?: (...args: any[]) => void
  onLabelClick?: JSX.IntrinsicElements['label']['onClick']
  disabled?: boolean
  checked?: boolean
  htmlSize?: number
  size?: Size
  indeterminate?: boolean
  leadingLabel?: boolean
}

const Label = styled.label<{
  hasError?: boolean
  size: Size
  disabled?: boolean
  leadingLabel?: boolean
}>`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  border: ${theme.colors.text.dark.secondary};
  cursor: pointer;

  input {
    ${visuallyHidden()}

    /* Increase border width and adjust the circles to it */
    &:checked {
      + i {
        border-width: 2px;
      }
    }

    /* Default state */
    &:not(:disabled) {
      &:focus + i,
      [data-js-focus-visible] &[data-focus-visible-added]:focus + i {
        border: 2px solid ${theme.colors.secondary.main};
      }

      [data-js-focus-visible] &:focus + i {
        border: 1px solid ${theme.colors.text.dark.secondary};
      }
      &:focus:not(:focus-visible) + i {
        border: 1px solid ${theme.colors.text.dark.secondary};
      }

      &:focus + i:after,
      [data-js-focus-visible] &[data-focus-visible-added]:focus + i:after {
        opacity: 1;
      }

      [data-js-focus-visible] &:focus + i:after {
        opacity: 0;
      }
      &:focus:not(:focus-visible) + i:after {
        opacity: 0;
      }

      &:hover + i,
      [data-js-focus-visible] &:hover + i {
        border: 2px solid ${theme.colors.secondary.dark};
      }
      &:focus:not(:focus-visible):hover + i {
        border: 2px solid ${theme.colors.secondary.dark};
      }
    }

    /* Checked */
    &:not(:disabled):checked {
      + i,
      [data-js-focus-visible] &:focus + i {
        border-color: ${theme.colors.secondary.main};
        background-color: ${theme.colors.secondary.main};
      }

      &:not(:focus-visible) + i {
        border-color: ${theme.colors.secondary.main};
        background-color: ${theme.colors.secondary.main};
      }

      &:hover + i,
      [data-js-focus-visible] &:hover + i {
        border-color: ${theme.colors.secondary.dark};
        background-color: ${theme.colors.secondary.dark};
      }

      &:hover:not(:focus-visible) + i {
        border-color: ${theme.colors.secondary.dark};
        background-color: ${theme.colors.secondary.dark};
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
        background-color: ${theme.colors.text.dark.disabled};
        border: 0;
      }
    }
  }

  i {
    display: block;
    border-radius: 1px;
    position: relative;
    background-color: ${theme.colors.surface.primary};
    border: 1px solid ${theme.colors.text.dark.secondary};
    width: ${(p) => checkboxSizes[p.size].checkbox};
    height: ${(p) => checkboxSizes[p.size].checkbox};
    pointer-events: none;
    flex-shrink: 0;

    &:after {
      content: '';
      opacity: 0;
      width: ${(p) => checkboxSizes[p.size].outline};
      height: ${(p) => checkboxSizes[p.size].outline};
      border-radius: 3px;
      border: 2px solid ${theme.colors.secondary.main};
      box-shadow: 0 0 4px 0 ${theme.colors.secondary.main};
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

  ${(p) =>
    p.hasError &&
    css`
      input:not(:disabled) {
        + i {
          border-width: 2px;
          border-color: ${theme.colors.status.alert};
        }

        &:checked + i {
          border-color: ${theme.colors.status.alert};
          background-color: ${theme.colors.status.alert};
        }
        &:hover {
          + i {
            /* #981824 = darken(theme.colors.status.alert, 20%) */
            border-color: #981824 !important;
          }

          &:checked + i {
            border-color: #981824;
            background-color: #981824;
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

const StyledLabelText = styled(Text, { shouldForwardProp: (p) => p !== 'leadingLabel' })<{
  size: Size
  leadingLabel?: boolean
}>`
  ${(p) =>
    p.leadingLabel
      ? css`
          margin-right: ${theme.spacing.xs};
        `
      : css`
          margin-left: ${theme.spacing.xs};
        `}
`

const Checkmark = styled(Yes)<{ size: Size }>`
  color: ${theme.colors.text.light.primary};
  font-size: ${(p) => checkboxSizes[p.size].checkbox};
`

const Indeterminate = styled(Minus)<{ size: Size }>`
  color: ${theme.colors.text.light.primary};
  font-size: ${(p) => checkboxSizes[p.size].checkbox};
`

const Checkbox: React.ForwardRefRenderFunction<HTMLInputElement, CheckboxProps> = (
  {
    children,
    className,
    error,
    checked = false,
    disabled,
    indeterminate = false,
    onChange,
    onLabelClick,
    size = 'medium',
    htmlSize,
    leadingLabel,
    ...rest
  },
  ref
) => {
  return (
    <Label
      hasError={error}
      size={size}
      className={className}
      disabled={disabled}
      leadingLabel={leadingLabel}
      onClick={onLabelClick}
    >
      {children && leadingLabel && (
        <StyledLabelText as="span" styledAs={'body'} size={size} leadingLabel={leadingLabel}>
          {children}
        </StyledLabelText>
      )}

      <input
        type="checkbox"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        readOnly={!onChange}
        aria-invalid={error}
        size={htmlSize}
        ref={ref}
        {...rest}
      />
      <i>
        {indeterminate ? (
          <Indeterminate size={size} focusable="false" />
        ) : (
          checked && <Checkmark size={size} focusable="false" />
        )}
      </i>

      {children && !leadingLabel && (
        <StyledLabelText as="span" styledAs={'body'} size={size} leadingLabel={leadingLabel}>
          {children}
        </StyledLabelText>
      )}
    </Label>
  )
}

export default React.forwardRef(Checkbox)
