import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import Label from '../label/Label'
import Select, { SelectProps } from '../select/Select'
import AssistiveText from '../assistive-text/AssistiveText'
import ErrorText from '../error-text/ErrorText'
import { v4 as uuidv4 } from 'uuid'

type SelectFieldProps = SelectProps & {
  label?: React.ReactNode
  disabled?: boolean
  errorMessage?: string
  assistiveText?: string
  selected?: string
  defaultValue?: string
  value?: string
  inverted?: boolean
  as?: React.ElementType
}

const margins = css`
  margin-bottom: 4px;
  display: block;
`

// SelectField is a composite component used to encapsulate a complete field with label, select and error
const SelectField: React.ForwardRefRenderFunction<HTMLInputElement, SelectFieldProps> = (props, ref) => {
  const { label, assistiveText, selected, required, errorMessage, className, inverted, size, name, value, ...rest } =
    props
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
        required={required}
        css={css`
          ${margins}
        `}
        size={size}
        inverted={inverted}
        htmlFor={fieldName}
      >
        {label}
      </Label>
      <Select
        ref={ref as any}
        name={fieldName}
        id={fieldName}
        value={value || selected}
        size={size}
        error={!!errorMessage || undefined}
        aria-describedby={assistiveText || errorMessage ? fieldName + '_aria' : undefined}
        {...rest}
      />
      {assistiveText && !errorMessage && (
        <AssistiveText inverted={inverted} id={fieldName + '_aria'}>
          {assistiveText}
        </AssistiveText>
      )}
      {errorMessage && (
        <ErrorText
          id={fieldName + '_aria'}
          role="alert"
          small
          css={css`
            height: 15px;
          `}
        >
          {errorMessage}
        </ErrorText>
      )}
    </div>
  )
}

export default styled(React.forwardRef(SelectField))()
