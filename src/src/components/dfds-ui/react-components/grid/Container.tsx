import React from 'react'
import { Container as Container_, Grid } from '@mui/material'
import { StylesProvider } from '@mui/styles'
import createBreakpoints from '@mui/system/createTheme/createBreakpoints'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { theme as DfdsTheme } from '@dfds-ui/theme'
import { spacing } from '@dfds-ui/spacing'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { SurfaceType, getBackgroundColor, MaybeSurfaceProvider } from '../surface'

type ContainerProps = {
  /**
   * Specify whether the container spans the entire width of its parent or it has a max-width set to 1200px (75rem)
   */
  fluid?: boolean
  /**
   * Specify the surface variant for the container
   */
  surface?: SurfaceType

  children?: React.ReactNode
}

const breakpointsObj = createBreakpoints({
  values: {
    xs: DfdsTheme.breakpoints.s,
    sm: DfdsTheme.breakpoints.m,
    md: DfdsTheme.breakpoints.l,
    lg: DfdsTheme.breakpoints.xl,
    xl: DfdsTheme.breakpoints.xxl,
  },
})

const theme = createTheme({
  breakpoints: breakpointsObj,
  spacing: () => spacing.s,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          marginBottom: `${spacing.xs}`,

          [breakpointsObj.only('xs')]: {
            paddingLeft: '0px',
            paddingRight: '0px',
          },
          [breakpointsObj.only('sm')]: {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
          [breakpointsObj.only('md')]: {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
          [breakpointsObj.up('lg')]: {
            paddingLeft: '0px',
            paddingRight: '0px',
          },
        },
      },
    },
  },
})

const ContainerStyled = styled(Container_)`
  @media screen and (min-width: ${breakpointsObj.values.lg}px) {
    max-width: 1200px;
  }

  @media screen and (min-width: ${breakpointsObj.values.sm + 1}px) and (max-width: ${breakpointsObj.values.lg - 1}px) {
    max-width: none;
  }

  @media screen and (max-width: ${breakpointsObj.values.sm}px) {
    max-width: none;

    .MuiGrid-spacing-xs-1 {
      width: unset;
      margin: unset;
    }

    .MuiGrid-spacing-xs-1 > .MuiGrid-item {
      padding: unset;
    }
  }
`

const Container: React.FC<ContainerProps> = ({ children, fluid, surface, ...rest }) => {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst>
        <MaybeSurfaceProvider surface={surface}>
          <Wrapper fluid={fluid} surface={surface}>
            <ContainerStyled
              css={css`
                background-color: ${surface && getBackgroundColor(surface)};
              `}
              {...rest}
            >
              <Grid container spacing={1}>
                {children}
              </Grid>
            </ContainerStyled>
          </Wrapper>
        </MaybeSurfaceProvider>
      </StylesProvider>
    </ThemeProvider>
  )
}

const Wrapper: React.FC<ContainerProps> = ({ children, fluid, surface }) => (
  <> {fluid ? <div css={{ backgroundColor: surface && getBackgroundColor(surface) }}>{children}</div> : children} </>
)

export default Container
