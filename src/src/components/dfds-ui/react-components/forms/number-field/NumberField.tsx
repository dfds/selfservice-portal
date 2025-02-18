import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import TextField, { TextFieldProps } from '../text-field/TextField'

const textFieldStyles = css`
  input[type='number'] {
    appearance: textfield;
  }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
`

// NumberField is a composite component used to encapsulate a complete field with label, input and error/hint
const NumberField: React.ForwardRefRenderFunction<HTMLInputElement, TextFieldProps> = (props, ref) => {
  return <TextField {...props} css={textFieldStyles} ref={ref as any} type="number" />
}

export default styled(React.forwardRef(NumberField))()
