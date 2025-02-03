/* eslint-disable deprecation/deprecation */
import React, { useState } from 'react'
import { Hidden, Shown } from '@/dfds-ui/icons/src'
import TextField, { TextFieldProps } from '../text-field/TextField'
import styled from '@emotion/styled'

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  height: 100%;
  width: 100%;
  cursor: pointer;
`
const PasswordField: React.ForwardRefRenderFunction<HTMLInputElement, TextFieldProps> = (props, ref) => {
  const [visible, setVisible] = useState(false)

  const PasswordIcon = ({ showAsText }: { showAsText: boolean }) => (
    <IconWrapper onClick={() => setVisible(!showAsText)}>{showAsText ? <Shown /> : <Hidden />}</IconWrapper>
  )

  return (
    <TextField
      {...props}
      ref={ref as any}
      type={visible ? 'text' : 'password'}
      icon={<PasswordIcon showAsText={visible} />}
    />
  )
}

export default React.forwardRef(PasswordField)
