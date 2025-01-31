import React from 'react'
import styled from '@emotion/styled'
import { theme } from '@/components/dfds-ui/theme'

const Wrapper = styled.span`
  color: ${theme.colors.secondary.main};
  padding-left: 5px;
`

const Asterisk = () => {
  return <Wrapper>*</Wrapper>
}

export default Asterisk
