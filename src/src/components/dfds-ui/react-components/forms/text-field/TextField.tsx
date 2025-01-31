import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import Label from '../label/Label'
import Input, { Size } from '../input/Input'
import AssistiveText from '../assistive-text/AssistiveText'
import ErrorText from '../error-text/ErrorText'
import { v4 as uuidv4 } from 'uuid'

export type BaseInputProps = Omit<JSX.IntrinsicElements['input'], 'size' | 'css'>
// TODO: extend on JSX.IntrinsicElements['input'] will give us some of the other props
export type TextFieldProps = BaseInputProps & {
  label?: React.ReactNode
  name?: string
  required?: boolean
  hintText?: string
  disabled?: boolean
  defaultValue?: string
  errorMessage?: string
  assistiveText?: string
  className?: string
  size?: Size
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  icon?: React.ReactNode
  inverted?: boolean
  type?: string
  hideAsterisk?: boolean
}

const margins = css`
  margin-bottom: 4px;
  display: block;
`

// TextField is a composite component used to encapsulate a complete field with label, input and error/hint
export const TextField: React.ForwardRefRenderFunction<HTMLInputElement, TextFieldProps> = (props, ref) => {
  const {
    label,
    name,
    hintText,
    disabled,
    defaultValue,
    assistiveText,
    required,
    errorMessage,
    className,
    inverted,
    size,
    type,
    hideAsterisk,
    ...rest
  } = props
  const fieldName = name || uuidv4()
  return (
    <div
      className={className}
      css={
        assistiveText || errorMessage
          ? css`
              margin-bottom: 5px;
            `
          : css`
              margin-bottom: 20px;
            `
      }
    >
      <Label
        size={size}
        inverted={inverted}
        required={required}
        hideAsterisk={hideAsterisk}
        css={css`
          ${margins}
        `}
        htmlFor={fieldName}
      >
        {label}
      </Label>
      <Input
        id={fieldName}
        type={type}
        name={fieldName}
        disabled={disabled}
        defaultValue={defaultValue}
        placeholder={hintText}
        error={!!errorMessage || undefined}
        size={size}
        ref={ref as any}
        aria-describedby={assistiveText || errorMessage ? fieldName + '_aria' : undefined}
        {...rest}
        css={css`
          margin-bottom: 4px;
        `}
      />
      {assistiveText && !errorMessage && (
        <AssistiveText inverted={inverted} id={fieldName + '_aria'}>
          {assistiveText}
        </AssistiveText>
      )}
      {errorMessage && (
        <ErrorText id={fieldName + '_aria'} role="alert" small>
          {errorMessage}
        </ErrorText>
      )}
    </div>
  )
}

export default styled(React.forwardRef(TextField))()
