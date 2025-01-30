import React, { forwardRef } from 'react'
import { css } from '@emotion/react'
import { useForwardedRef } from '@/components/dfds-ui/hooks'
import { FlexBox } from '@dfds-ui/react-components/flexbox'
import { theme } from '@/components/dfds-ui/theme'
import { InputComposition, InputIcon, InputControl } from '@dfds-ui/react-components/forms/input/InputComposition'
import { typography } from '@/components/dfds-ui/typography'

type ReactInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

// TODO: Refactor these types
export type EnhancedInputProps<TValue> = Omit<EnhancedFieldProps, 'value'> & {
  value?: TValue
}

export type EnhancedFieldProps = Omit<ReactInputProps, 'size' | 'css'> & {
  name?: string
  /**
   * Label to be displayed
   */
  label?: React.ReactNode
  /**
   * Icon to be displayed
   */
  icon?: React.ElementType
  className?: string
  onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void
}

const { colors } = theme

export const EnhancedField = forwardRef<HTMLInputElement, EnhancedFieldProps>(
  ({ onClick, className, label, icon, disabled, name, ...rest }, ref) => {
    const inputRef = useForwardedRef(ref)
    const handleClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      onClick && onClick(e)
      if (inputRef && inputRef.current) {
        inputRef.current.focus()
      }
    }
    return (
      <InputComposition
        css={css`
          height: 50px;
          justify-content: center;
        `}
        className={className}
        onClick={handleClick}
        aria-disabled={disabled}
      >
        {icon && (
          <InputIcon
            icon={icon}
            css={css`
              font-size: 32px;
              color: ${disabled ? colors.text.dark.disabled : colors.secondary.main};
            `}
          />
        )}
        <FlexBox
          flex={1}
          directionColumn
          justifyCenter
          css={css`
            margin-left: 10px;
          `}
        >
          <span
            css={css`
              ${typography.caption};
              white-space: nowrap;
              color: ${disabled ? colors.text.dark.disabled : colors.text.dark.primary};
            `}
          >
            {label}
          </span>
          <InputControl
            name={name || ''}
            disabled={disabled}
            css={css`
              padding-left: 0;
            `}
            {...rest}
            ref={inputRef}
          />
        </FlexBox>
      </InputComposition>
    )
  }
)

export default EnhancedField
