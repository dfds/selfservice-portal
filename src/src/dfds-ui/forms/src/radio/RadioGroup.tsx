import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { Label } from '../label/Label'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import ErrorText from '../error-text/ErrorText'
import { BaseFieldProps } from '../types'
import { RadioContextProvider } from './RadioContext'
import { RadioProps } from './Radio'
import HelpIcon from '../help-icon/HelpIcon'
import { theme } from '@/dfds-ui/theme/src'

export type RadioGroupProps = Pick<
  BaseFieldProps,
  'help' | 'label' | 'required' | 'hideAsterisk' | 'disabled' | 'errorMessage'
> &
  Pick<RadioProps, 'visualSize'> & {
    children: ReactNode
    /**
     * Class name to be assigned to the component
     */
    className?: string
    column?: boolean
  }

const RadioGroupContainer = ({ children }: Partial<RadioGroupProps>) => {
  return (
    <fieldset
      css={css`
        display: flex;
        flex-direction: column;
        border: none;
        padding: 0;
        margin: 0;
      `}
    >
      {children}
    </fieldset>
  )
}

export const RadioGroup = ({
  visualSize = 'medium',
  label,
  children,
  column = true,
  errorMessage,
  help,
  required,
  hideAsterisk = false,
  className,
  disabled,
}: RadioGroupProps) => {
  return (
    <RadioGroupContainer className={className} errorMessage={errorMessage}>
      <RadioContextProvider value={{ visualSize, error: !!errorMessage }}>
        <FlexBox itemsFlexStart>
          <Label
            css={css`
              flex: 1;
              margin-bottom: ${theme.spacing.xs};
            `}
            disabled={disabled}
            visualSize={visualSize}
            required={required}
            hideAsterisk={hideAsterisk}
          >
            {label}
          </Label>
          {help && <HelpIcon content={help} />}
        </FlexBox>
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
      </RadioContextProvider>
      {errorMessage && (
        <FlexBox
          css={css`
            margin-top: 0.25rem;
          `}
        >
          <ErrorText>{errorMessage}</ErrorText>
        </FlexBox>
      )}
    </RadioGroupContainer>
  )
}
