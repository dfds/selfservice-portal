import React, { ReactNode } from 'react'
import { FlexBox } from '@/components/dfds-ui/react-components/flexbox'
import { css } from '@emotion/react'
import { Label } from '../label/Label'
import { BaseFieldProps, Size } from '../types'
import HelpIcon from '../help-icon/HelpIcon'
import { AssistiveText } from '../assistive-text/AssistiveText'
import { ErrorText } from '../error-text/ErrorText'

export type FieldWrapProps = BaseFieldProps & {
  size: Size
  extraAssistiveText?: string
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export const FieldWrap = ({
  name,
  assistiveText,
  errorMessage,
  size,
  required,
  hideAsterisk,
  label,
  help,
  extraAssistiveText,
  disabled,
  className,
  children,
}: FieldWrapProps) => {
  if (assistiveText === ' ') {
    assistiveText = '\u00A0'
  }

  return (
    <FlexBox directionColumn className={className}>
      <FlexBox itemsFlexStart>
        {label && (
          <Label
            css={css`
              flex: 1;
              margin-bottom: 0.25rem;
            `}
            visualSize={size}
            required={required}
            hideAsterisk={hideAsterisk}
            disabled={disabled}
          >
            {label}
          </Label>
        )}
        {help && <HelpIcon content={help} disabled={disabled} />}
      </FlexBox>
      {children}
      {(assistiveText || errorMessage || extraAssistiveText) && (
        <FlexBox
          css={css`
            margin-top: 0.25rem;
          `}
          {...(assistiveText || errorMessage ? { justifySpaceBetween: true } : { justifyFlexEnd: true })}
        >
          {assistiveText && !errorMessage && (
            <AssistiveText disabled={disabled} id={`${name}_aria`}>
              {assistiveText}
            </AssistiveText>
          )}
          {errorMessage && <ErrorText id={`${name}_aria`}>{errorMessage}</ErrorText>}
          {/* Extra assistive text is always shown on the right */}
          {extraAssistiveText && <AssistiveText disabled={disabled}>{extraAssistiveText}</AssistiveText>}
        </FlexBox>
      )}
    </FlexBox>
  )
}
