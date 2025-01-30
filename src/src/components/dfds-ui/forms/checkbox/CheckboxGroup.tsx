import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { Label } from '../label/Label'
import { FlexBox } from '@dfds-ui/react-components/flexbox'
import { ErrorText } from '../error-text/ErrorText'
import { BaseFieldProps } from '../types'
import { CheckboxContextProvider } from './CheckboxContext'
import { CheckboxProps } from './Checkbox'
import { AssistiveText } from '../assistive-text/AssistiveText'
import HelpIcon from '../help-icon/HelpIcon'
import { theme } from '@/components/dfds-ui/theme'

export type CheckboxGroupProps = Pick<
  BaseFieldProps,
  'help' | 'label' | 'required' | 'hideAsterisk' | 'disabled' | 'errorMessage' | 'assistiveText'
> &
  Pick<CheckboxProps, 'visualSize'> & {
    children: ReactNode
    /**
     * Indicates that the CheckboxGroup has an error.
     *
     * You can also set the `errorMessage` prop to indicate an error but setting `error` will trigger
     * the visual indication regardless of the value of `errorMessage`. Setting `errorMessage` and setting
     * `error` to `false` will however still render the visual indication.
     */
    error?: boolean
    /**
     * Class name to be assigned to the component
     */
    className?: string
    column?: boolean
  }

export const CheckboxGroup = ({
  visualSize = 'medium',
  help,
  label,
  children,
  column = true,
  assistiveText,
  errorMessage,
  error = false,
  required,
  className,
  disabled,
  ...rest
}: CheckboxGroupProps) => {
  return (
    <FlexBox
      as="fieldset"
      directionColumn
      css={css`
        border: none;
        padding: 0;
        margin: 0;
      `}
      className={className}
      {...rest}
    >
      <CheckboxContextProvider value={{ visualSize, error: !!errorMessage || error }}>
        {label && (
          <FlexBox itemsFlexStart>
            <Label
              css={css`
                flex: 1;
                margin-bottom: ${theme.spacing.xs};
              `}
              disabled={disabled}
              required={required}
              visualSize={visualSize}
            >
              {label}
            </Label>
            {help && <HelpIcon content={help} />}
          </FlexBox>
        )}

        <FlexBox
          directionColumn={column}
          gap={
            visualSize === 'medium'
              ? `${theme.spacing.s} ${theme.spacing.m}`
              : `calc(${theme.spacing.s} - ${theme.spacing.xxs}) ${theme.spacing.s}`
          }
          wrapWrap={column ? false : true}
        >
          {children}
        </FlexBox>
      </CheckboxContextProvider>
      {(assistiveText || errorMessage) && (
        <FlexBox
          css={css`
            margin-top: 0.25rem;
          `}
        >
          {assistiveText && !errorMessage && <AssistiveText disabled={disabled}>{assistiveText}</AssistiveText>}
          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        </FlexBox>
      )}
    </FlexBox>
  )
}
