import React from 'react'
import styled from '@emotion/styled'
import { theme } from '@dfds-ui/theme'

type RenderAs = {
  as?: React.ElementType
}

type LayoutProps = { fullWidth?: boolean; className?: string } & RenderAs

type LayoutChildProps = { fullWidth?: boolean; className?: string } & RenderAs

const Container = styled.div`
  margin: 0 auto;
`

export const LayoutGrid = styled.div<LayoutProps>`
  /* stylelint-disable */
  display: -ms-grid;
  -ms-grid-rows: auto minmax(1fr, 100%) auto;
  -ms-grid-columns: 1fr;
  /* stylelint-enable */
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(0, 1fr); /* ensure min-width is defined and not auto */
  min-height: 100vh;
  height: 100%;
  ${Container} {
    max-width: ${({ fullWidth }) => !fullWidth && '1200px'};
  }
`

const GridHeader = styled.div<LayoutChildProps>`
  /* stylelint-disable */
  -ms-grid-row: 1;
  /* stylelint-enable */
  grid-row: 1;
  background-color: ${theme.colors.surface.primary};
  ${Container} {
    max-width: ${({ fullWidth }) => fullWidth && 'initial'};
  }
`

const GridMain = styled.div<LayoutChildProps>`
  /* stylelint-disable */
  -ms-grid-row: 2;
  /* stylelint-enable */
  grid-row: 2;
  background-color: ${theme.colors.surface.secondary};
  ${Container} {
    max-width: ${({ fullWidth }) => fullWidth && 'initial'};
  }
`

const GridFooter = styled.div<LayoutChildProps>`
  /* stylelint-disable */
  -ms-grid-row: 3;
  /* stylelint-enable */
  grid-row: 3;
  background-color: #dde6ed;
  ${Container} {
    max-width: ${({ fullWidth }) => fullWidth && 'initial'};
  }
`

export const Layout: React.FunctionComponent<LayoutProps> = ({ children, className, as = 'div', ...rest }) => {
  return (
    <LayoutGrid className={className} as={as} {...rest}>
      {children}
    </LayoutGrid>
  )
}

export const LayoutHeader: React.FunctionComponent<LayoutChildProps> = ({ children, className, as, ...rest }) => {
  return (
    <GridHeader className={className} as={as} {...rest}>
      <Container>{children}</Container>
    </GridHeader>
  )
}

export const LayoutMain: React.FunctionComponent<LayoutChildProps> = ({ children, className, as, ...rest }) => {
  return (
    <GridMain className={className} as={as} {...rest}>
      <Container>{children}</Container>
    </GridMain>
  )
}

export const LayoutFooter: React.FunctionComponent<LayoutChildProps> = ({ children, className, as, ...rest }) => {
  return (
    <GridFooter className={className} as={as} {...rest}>
      <Container>{children}</Container>
    </GridFooter>
  )
}

export default {
  Grid: LayoutGrid,
  Header: LayoutHeader,
  Main: LayoutMain,
  Footer: LayoutFooter,
}
