import * as React from 'react'
import { SvgDfdsLogo } from '@/components/dfds-ui/icons'
import styled from '@emotion/styled'
import { theme } from '@/components/dfds-ui/theme'

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
