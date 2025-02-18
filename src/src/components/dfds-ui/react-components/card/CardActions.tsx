import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { FlexBox } from '../flexbox'
import { FlexBoxProps } from '../flexbox/FlexBox'
import { theme } from '@/components/dfds-ui/theme'

const ActionContainer = styled(FlexBox)`
  flex-wrap: wrap;
  flex-direction: row;
  flex: 1 1 auto;
  padding-top: ${theme.spacing.s};
`

const CardActions: FunctionComponent<FlexBoxProps> = ({ children, ...rest }) => (
  <ActionContainer className="CardActions" {...rest}>
    {children}
  </ActionContainer>
)

export default CardActions
