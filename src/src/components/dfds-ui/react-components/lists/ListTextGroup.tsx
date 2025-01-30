import React from 'react'
import { css } from '@emotion/react'
import { FlexBoxProps, flexBoxStyles } from '../flexbox/FlexBox'
import { theme } from '@dfds-ui/theme'

export type ListTextGroupProps = {
  /**
   * Props controlling the flexbox.
   */
  flexBoxProps?: FlexBoxProps

  /**
   * HTML tag or custom component being rendered.
   */
  as?: React.ElementType
  children?: React.ReactNode
}

const ListTextGroup = ({
  flexBoxProps = { flex: 1, justifyCenter: true, directionColumn: true },
  as = 'span',
  ...rest
}: ListTextGroupProps) => {
  const Component = as
  return (
    <Component
      css={css`
        ${flexBoxStyles(flexBoxProps)}
        margin: 0;
        &:not(:last-child) {
          margin-right: ${theme.spacing.xs};
        }
      `}
      {...rest}
    />
  )
}

export default ListTextGroup
