import React, { forwardRef } from 'react'
import { css } from '@emotion/react'
import { BaseFieldProps, Size } from '../types'
import { theme } from '@/dfds-ui/theme/src'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import {
  InputComposition,
  InputControl,
  InputAddon,
  InputIcon,
} from '@/dfds-ui/react-components/src/forms/input/InputComposition'
import { HelpIcon } from '../help-icon/HelpIcon'
import { FieldWrap } from '../field-wrap/FieldWrap'

export type TextFieldProps = BaseFieldProps & {
  autoFocus?: boolean
  defaultValue?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  icon?: React.ElementType
  /**
   * Element to be placed after the input element.
   *
   * Useful for adding a button next to the TextField.
   */
  adornment?: React.ReactNode
  className?: string
  value?: string
  visualSize?: Size
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputType?: 'email' | 'text' | 'tel' | 'time' | 'url' | 'date' | 'file' | 'number' | 'search' | 'password'
  autoComplete?: string
  minValue?: string
  maxValue?: string
  maxLength?: number
  minLength?: number
  readOnly?: boolean
  step?: number | 'any'
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      name,
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      prefix,
      className,
      suffix,
      icon,
      help,
      helpPlacement = 'top',
      adornment,
      assistiveText,
      errorMessage,
      disabled,
      required,
      hideAsterisk,
      visualSize = 'medium',
      inputType = 'text',
      minValue,
      maxValue,
      autoComplete,
      ...rest
    }: TextFieldProps,
    ref
  ) => {
    // Show picker (if any) when the input is clicked.
    const showPicker = (e: EventTarget & { showPicker?: () => void }) => {
      if (inputType !== 'date') return

      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          e?.showPicker?.()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
        }
      }
    }

    return (
      <FieldWrap
        className={className}
        name={name}
        label={label}
        assistiveText={assistiveText}
        errorMessage={errorMessage}
        size={visualSize}
        required={required}
        disabled={disabled}
        hideAsterisk={hideAsterisk}
        help={help && helpPlacement === 'top' ? help : undefined}
      >
        <FlexBox directionRow itemsCenter>
          <InputComposition
            css={css`
              flex: 1;
            `}
            visualSize={visualSize}
          >
            {prefix && (
              <InputAddon
                css={css`
                  ${disabled &&
                  css`
                    color: ${theme.colors.text.primary.disabled};
                  `};
                `}
              >
                {prefix}
              </InputAddon>
            )}
            <InputControl
              name={name}
              value={value}
              defaultValue={defaultValue}
              onClick={(e) => e && showPicker(e.target)}
              onChange={(e) => {
                onChange && onChange(e)
              }}
              onFocus={(e) => {
                onFocus && onFocus(e)
              }}
              onBlur={(e) => {
                onBlur && onBlur(e)
              }}
              placeholder={placeholder}
              error={!!errorMessage}
              disabled={disabled}
              type={inputType}
              ref={ref}
              autoComplete={autoComplete}
              aria-required={required}
              css={
                inputType === 'file' &&
                css`
                  align-self: auto;
                `
              }
              min={minValue}
              max={maxValue}
              {...rest}
            />
            {suffix && (
              <InputAddon
                css={css`
                  padding-right: 0.25rem;
                  ${disabled &&
                  css`
                    color: ${theme.colors.text.primary.disabled};
                  `};
                `}
              >
                {suffix}
              </InputAddon>
            )}
            {icon && <InputIcon icon={icon} />}
          </InputComposition>
          {adornment}
          {help && helpPlacement === 'right' && (
            <HelpIcon
              css={css`
                margin: 0.5rem;
              `}
              content={help}
            />
          )}
        </FlexBox>
      </FieldWrap>
    )
  }
)

export default TextField
