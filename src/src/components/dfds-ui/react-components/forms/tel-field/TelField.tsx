import React from 'react'
import styled from '@emotion/styled'
import TextField, { TextFieldProps } from '../text-field/TextField'

// TelField is a composite component used to encapsulate a complete field with label, input and error/hint

const TelField: React.ForwardRefRenderFunction<HTMLInputElement, TextFieldProps> = (props, ref) => {
  return <TextField {...props} ref={ref as any} type="tel" />
}

export default styled(React.forwardRef(TelField))()
