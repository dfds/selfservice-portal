import * as React from 'react'
import { SvgDfdsLogo } from '@/dfds-ui/icons/src'
import styled from '@emotion/styled'
import { theme } from '@/dfds-ui/theme/src'

export type LogoProps = {
  className?: string
  title?: string
  width?: string | number
  height?: string | number
  logoContainerProps?: any
}

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;

  ${theme.states.overlay(false, {
    color: theme.colors.secondary.main,
    hover: '0',
    active: '0',
  })};
`

const Logo = ({ logoContainerProps, ...rest }: LogoProps) => {
  return logoContainerProps ? (
    <LogoContainer {...logoContainerProps}>
      <SvgDfdsLogo data-testid="Logo" {...rest} />
    </LogoContainer>
  ) : (
    <SvgDfdsLogo data-testid="Logo" {...rest} />
  )
}

export { Logo }
export default Logo
