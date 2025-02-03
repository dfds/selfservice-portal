import React from 'react'

import { Grid } from '@mui/material'

type ColumnProps = {
  m?: 6 | 12
  l?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xxl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  children?: React.ReactNode
}

const Column: React.FunctionComponent<ColumnProps> = ({ children, m, l, xl, xxl, ...rest }) => {
  return (
    <Grid
      item
      xs={12}
      sm={m || 6}
      md={l || m || true}
      lg={xl || l || m || true}
      xl={xxl || xl || l || m || true}
      {...rest}
    >
      {children}
    </Grid>
  )
}

export default Column
