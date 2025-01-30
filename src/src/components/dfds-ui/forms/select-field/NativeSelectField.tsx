import React, { forwardRef } from 'react'
import { css } from '@emotion/react'
import { BaseFieldProps, Size } from '../types'
import { ChevronDown } from '@dfds-ui/icons/system/'
import { theme } from '@/components/dfds-ui/theme'
import { FieldWrap } from '../field-wrap/FieldWrap'
import { inputTypography } from '@/components/dfds-ui/react-components/forms/input/InputComposition'

export type NativeSelectFieldProps = BaseFieldProps &
  React.ComponentPropsWithRef<'select'> & {
    className?: string
    visualSize?: Size
  }

const SelectChevron = () => {
  return (
    <ChevronDown
      className="native-select-chevron"
      css={css`
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translate(0px, -50%);
        pointer-events: none;
        font-size: 24px;
        color: ${theme.colors.text.dark.secondary};
      `}
    />
  )
}

const heights = {
  small: '2rem',
  medium: '2.5rem',
  large: '3rem',
}

const leftPaddings = {
  small: '0.5rem',
  medium: '1rem',
  large: '1rem',
}

export const NativeSelectField = forwardRef<HTMLSelectElement, NativeSelectFieldProps>(
  (
    {
      name,
      label,
      defaultValue,
      className,
      help,
      children,
      helpPlacement = 'top',
      assistiveText,
      errorMessage,
      disabled,
      required,
      hideAsterisk,
      visualSize = 'medium',
      ...rest
    }: NativeSelectFieldProps,
    ref
  ) => {
    return (
      <FieldWrap
        className={className}
        name={name}
        label={label}
        assistiveText={assistiveText}
        errorMessage={errorMessage}
        size={visualSize}
        required={required}
        hideAsterisk={hideAsterisk}
        help={help && helpPlacement === 'top' ? help : undefined}
      >
        <div
          css={css`
            display: flex;
            position: relative;
            height: ${heights[visualSize]};
          `}
        >
          <select
            css={css`
              flex: 1;
              ${inputTypography(visualSize)};
              border: 0;
              background-color: ${theme.colors.surface.primary};
              color: ${theme.colors.text.dark.primary};
              padding: 0 calc(2rem - 1px) 0 calc(${leftPaddings[visualSize]} - 1px);
              border: 1px solid ${theme.colors.text.dark.secondary};

              appearance: none;
              ::-ms-expand {
                display: none;
              }

              &:hover {
                border: 1px solid ${theme.colors.text.dark.primary};
                & ~ .native-select-chevron {
                  color: ${theme.colors.text.dark.primary};
                }
              }

              &:focus {
                outline: 0;
                border: 1px solid ${theme.colors.secondary.main};
                box-shadow: inset 0 0 0 1px ${theme.colors.secondary.main};
                & ~ .native-select-chevron {
                  color: ${theme.colors.secondary.main};
                }
              }

              &[disabled] {
                pointer-events: none;
                color: ${theme.colors.text.dark.disabled};
                opacity: 1; /* Some browsers use natively */
                border: 1px solid ${theme.colors.text.dark.disabled};
                & ~ .native-select-chevron {
                  opacity: 0;
                }
              }

              &[aria-invalid='true'] {
                border: 1px solid ${theme.colors.status.alert};
                box-shadow: inset 0 0 0 1px ${theme.colors.status.alert};
                & ~ .native-select-chevron {
                  color: ${theme.colors.status.alert};
                }
              }
            `}
            name={name}
            defaultValue={defaultValue}
            aria-invalid={!!errorMessage}
            disabled={disabled}
            {...rest}
            ref={ref}
          >
            {children}
          </select>
          <SelectChevron />
        </div>
      </FieldWrap>
    )
  }
)

export default NativeSelectField
