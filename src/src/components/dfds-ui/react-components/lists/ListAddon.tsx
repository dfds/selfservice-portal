import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import ListIcon from './ListIcon'

export type ListAddonProps = {
  className?: string
  /**
   * HTML tag or custom component being rendered.
   */
  as?: React.ElementType
  children?: React.ReactNode
}

const ListAddon = ({ className, as = 'span', children, ...rest }: ListAddonProps) => {
  const Component = as
  return (
    <ListIcon
      icon={(props) => <Component {...props}>{children}</Component>}
      css={css`
        flex-basis: auto;
        height: auto;
        margin: 0;
        &:first-of-type {
          margin-left: -${theme.spacing.xs};
        }
        &:last-of-type {
          margin-right: -${theme.spacing.xs};
        }
      `}
      {...rest}
    />
  )
}

export default ListAddon
