import React, { forwardRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { Show, Hide } from '@dfds-ui/icons/system'
import { TextFieldProps } from '../text-field/TextField'
import TextField from '../text-field/TextField'

export type PasswordFieldProps = Omit<TextFieldProps, 'icon' | 'inputType'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>((props, ref) => {
  const [visible, setVisible] = useState(false)

  const ToggleButton = () => {
    const Icon = visible ? Show : Hide
    return (
      <Icon
        onClick={() => setVisible(!visible)}
        css={css`
          pointer-events: all;
          cursor: pointer;
          color: ${theme.colors.text.dark.primary};
        `}
      />
    )
  }

  return <TextField {...props} ref={ref} inputType={visible ? 'text' : 'password'} icon={ToggleButton} />
})
