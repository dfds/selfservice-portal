import React from 'react'
import { Container as Container_, Grid } from '@mui/material'
import { StylesProvider } from '@mui/styles'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { theme as DfdsTheme } from '@/dfds-ui/theme/src'
import { spacing } from '@/dfds-ui/spacing/src'
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

const theme = createTheme({
  breakpoints: {
    values: {
      xs: DfdsTheme.breakpoints.s,
      sm: DfdsTheme.breakpoints.m,
      md: DfdsTheme.breakpoints.l,
      lg: DfdsTheme.breakpoints.xl,
      xl: DfdsTheme.breakpoints.xxl,
    },
  },
  spacing: () => spacing.s,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          marginBottom: `${spacing.xs}`,
          [`@media (max-width:${DfdsTheme.breakpoints.s}px)`]: {
            paddingLeft: "0px",
            paddingRight: "0px",
          },
          [`@media (max-width:${DfdsTheme.breakpoints.m}px)`]: {
            paddingLeft: "40px",
            paddingRight: "40px",
          },
          [`@media (max-width:${DfdsTheme.breakpoints.l}px)`]: {
            paddingLeft: "40px",
            paddingRight: "40px",
          },
          [`@media (min-width:${DfdsTheme.breakpoints.xl}px)`]: {
            paddingLeft: "0px",
            paddingRight: "0px",
          },
        },
      },
    },
  },
});
const ContainerStyled = styled(Container_)`
  @media screen and (min-width: ${DfdsTheme.breakpoints.l}px) {
    max-width: 1200px;
  }

  @media screen and (min-width: ${DfdsTheme.breakpoints.s + 1}px) and (max-width: ${DfdsTheme.breakpoints.l - 1}px) {
    max-width: none;
  }

  @media screen and (max-width: ${DfdsTheme.breakpoints.s}px) {
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
