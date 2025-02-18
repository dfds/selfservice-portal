import React from 'react'
import { css } from '@emotion/react'
import ListItem, { ListItemProps } from './ListItem'

const ListTitle = ({ as = 'div', ...rest }: ListItemProps) => {
  return (
    <ListItem
      as={as}
      css={css`
        flex-basis: 100%;
        min-height: 3.625rem;
      `}
      {...rest}
    />
  )
}

export default ListTitle
