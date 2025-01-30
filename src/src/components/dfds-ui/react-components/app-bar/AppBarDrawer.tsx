import { theme } from '@dfds-ui/theme'
import styled from '@emotion/styled'
import { Drawer } from '@mui/material'
import * as React from 'react'

import { useAppBarContext } from './'

const APPBAR_HEIGHT = '3rem'

const StyledDrawer = styled(Drawer)`
  /* stylelint-disable */
  top: ${APPBAR_HEIGHT} !important;
  /* stylelint-enable */

  height: calc(100vh - ${APPBAR_HEIGHT});

  .MuiBackdrop-root {
    top: ${APPBAR_HEIGHT};
    /* stylelint-disable */
    opacity: 0 !important;
    /* stylelint-enable */
  }

  .MuiDrawer-paper {
    top: ${APPBAR_HEIGHT};
    box-shadow: ${theme.elevation['8']};
    height: calc(100vh - ${APPBAR_HEIGHT});
  }
`

const AppBarDrawer: React.FC<{ children?: React.ReactNode }> = ({ children, ...props }) => {
  const { drawerOpen, setDrawerOpen } = useAppBarContext()

  return (
    <StyledDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...props}>
      {children}
    </StyledDrawer>
  )
}

export default AppBarDrawer
