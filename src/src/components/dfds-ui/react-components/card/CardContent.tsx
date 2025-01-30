import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { theme } from '@dfds-ui/theme'
import { Text } from '@dfds-ui/typography'

export type CardContentProps = {
  /**
   * Text color
   */
  color?: string

  /**
   * className to be assigned to the component
   */
  className?: string
}

const ContentContainer = styled.div`
  padding-top: ${theme.spacing.s};
`

const Content = styled.div<CardContentProps>`
  color: ${(props) => (props.color ? props.color : '')};
`

const CardContent: FunctionComponent<CardContentProps> = ({ children, color, ...rest }) => (
  <ContentContainer {...rest}>
    <Content color={color}>
      <Text as="div" styledAs={'body'}>
        {children}
      </Text>
    </Content>
  </ContentContainer>
)

export default CardContent
