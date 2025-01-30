import React from 'react'
import { DividerProps, Divider } from '../divider'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

export type ListDividerProps = Pick<DividerProps, 'as' | 'indent' | 'margins'>

const ListDivider = ({ indent, margins, as = 'hr', ...rest }: ListDividerProps) => {
  return (
    <Divider
      indent={indent}
      margins={margins}
      as={as}
      css={css`
        margin: 0 ${margins ? theme.spacing.s : 0} 0 ${margins || indent ? theme.spacing.s : 0};
      `}
      {...rest}
    />
  )
}

export default ListDivider
