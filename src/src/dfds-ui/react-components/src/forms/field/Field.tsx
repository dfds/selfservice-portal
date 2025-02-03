import React from 'react'
import styled from '@emotion/styled'
import Label, { LabelProps } from '../label/Label'

type FieldProps = {
  labelProps?: LabelProps
  label?: React.ReactNode
  required?: boolean
  assistiveText?: string
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: DFDS;
`

const FieldLabel = styled(Label)`
  margin-bottom: 5px;
`

const Assistive = styled.div`
  margin-top: 5px;
  font-size: 12px;
`

const Field: React.FunctionComponent<FieldProps> = ({ label, required, assistiveText, children }) => {
  return (
    <Wrapper>
      {label !== undefined && <FieldLabel required={required}>{label}</FieldLabel>}
      {children}
      {assistiveText !== undefined && <Assistive>{assistiveText}</Assistive>}
    </Wrapper>
  )
}

export default Field
