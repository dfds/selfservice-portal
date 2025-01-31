import React, { ChangeEvent, forwardRef, useState } from 'react'
import { FieldWrap } from '../field-wrap/FieldWrap'
import { BaseFieldProps, Size } from '../types'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { styles as typographyStyles } from '@/components/dfds-ui/typography'

// Paddings applied to the input fields on rem units.
export const inputPaddings = {
  small: {
    vertical: 0.5,
    horizontal: 0.5,
  },
  medium: {
    vertical: 0.625,
    horizontal: 1,
  },
}

type FieldSize = Extract<Size, 'small' | 'medium'>
export type TextareaFieldProps = BaseFieldProps & {
  defaultValue?: string
  size?: FieldSize
  /**
   * Set a limit to the amount of characters the user may add. This number is also displayed on the bottom counter by default.
   */
  maxValueLength?: number
  /**
   * Whether to show the length counter at the bottom right
   */
  showLengthCounter?: boolean
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}

const textareaStyle = (size: FieldSize) => css`
  resize: none;
  align-self: stretch;
  width: 100%;
  border: 1px solid ${theme.colors.text.dark.secondary};
  background-color: ${theme.colors.surface.primary};
  /* 1 is substracted to match the border */
  padding: calc(${inputPaddings[size].vertical}rem - 1px) calc(${inputPaddings[size].horizontal}rem - 1px);
  color: ${theme.colors.text.dark.primary};
  ${typographyStyles.bodyInterface}

  &[aria-invalid='true'] {
    border: 2px solid ${theme.colors.status.alert};
    /* To take into account 2px border and avoid UI jumping */
    padding: calc(${inputPaddings[size].vertical}rem - 2px) calc(${inputPaddings[size].horizontal}rem - 2px);
  }

  &:focus,
  &[aria-haspopup='true'],
  &[aria-expanded='true'] {
    outline: 0;
    border: 2px solid ${theme.colors.secondary.main};
    /* To take into account 2px border and avoid UI jumping */
    padding: calc(${inputPaddings[size].vertical}rem - 2px) calc(${inputPaddings[size].horizontal}rem - 2px);
  }

  &[disabled] {
    pointer-events: none;
    color: ${theme.colors.text.dark.disabled};
    opacity: 1; /* Some browsers use natively */
    border: 1px solid ${theme.colors.text.dark.disabled};
    cursor: not-allowed;
  }

  /* Chrome, Firefox, Opera, Safari 10.1+ */
  ::placeholder {
    color: ${theme.colors.text.dark.disabled};
    opacity: 1; /* Firefox */
    text-align: left;
  }
  /* Internet Explorer 10-11 */
  :-ms-input-placeholder {
    color: ${theme.colors.text.dark.disabled};
  }
  /* Microsoft Edge */
  ::-ms-input-placeholder {
    color: ${theme.colors.text.dark.disabled};
  }
`

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      name,
      size = 'medium',
      assistiveText,
      errorMessage,
      required,
      hideAsterisk,
      label,
      help,
      defaultValue,
      value,
      onChange,
      maxValueLength,
      placeholder,
      disabled,
      showLengthCounter = true,
      rows = 3,
      ...rest
    },
    ref
  ) => {
    const initialText = value || defaultValue || ''
    const [length, setLength] = useState((value || defaultValue || '').length)
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (maxValueLength !== undefined && e.target.value.length > maxValueLength) {
        e.target.value = e.target.value.substring(0, maxValueLength)
      }
      setLength(e.target.value.length ?? length)
      onChange && onChange(e)
    }
    return (
      <FieldWrap
        name={name}
        size={size}
        {...(maxValueLength !== undefined && showLengthCounter
          ? {
              extraAssistiveText: `${length}/${maxValueLength}`,
            }
          : {})}
        assistiveText={assistiveText}
        disabled={disabled}
        errorMessage={errorMessage}
        required={required}
        hideAsterisk={hideAsterisk}
        label={label}
        help={help}
      >
        <textarea
          css={textareaStyle(size)}
          name={name}
          ref={ref}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          rows={rows}
          {...(value !== undefined ? {} : { defaultValue: initialText })}
          {...rest}
        ></textarea>
      </FieldWrap>
    )
  }
)
