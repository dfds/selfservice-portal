import React, { ReactNode } from 'react'
import { BaseFieldProps } from '../types'
import { css } from '@emotion/react'
import { SwitchProps } from './Switch'
import { Label } from '../label/Label'
import { SwitchContextProvider } from './SwitchContext'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import ErrorText from '../error-text/ErrorText'

export type SwitchGroupProps = Pick<BaseFieldProps, 'label' | 'errorMessage' | 'hideAsterisk' | 'required'> & {
  /**
   * JSX enclosed by the group.
   */
  children: ReactNode
} & Pick<SwitchProps, 'size'>

const SwitchGroupContainer = ({ children }: Partial<SwitchGroupProps>) => (
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

export const SwitchGroup = ({
  size = 'medium',
  label,
  errorMessage,
  required,
  hideAsterisk,
  children,
}: SwitchGroupProps) => {
  return (
    <SwitchGroupContainer>
      <SwitchContextProvider value={{ size, error: !!errorMessage }}>
        <Label required={required} hideAsterisk={hideAsterisk} visualSize={size}>
          {label}
        </Label>
        <FlexBox directionColumn>{children}</FlexBox>
      </SwitchContextProvider>
      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
    </SwitchGroupContainer>
  )
}
