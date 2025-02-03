import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { media } from '@/dfds-ui/theme/src'
import cx from 'classnames'

export type GridItemProps = {
  children: ReactNode
  small?: 6 | 12
  medium?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  large?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xlarge?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /**
   * Class name to be assigned to the component
   */
  className?: string
}

export const GridItem = (props: GridItemProps) => {
  const smallWidth = props.small || 12
  const mediumWidth = props.medium || smallWidth
  const largeWidth = props.large || mediumWidth
  const xLargeWidth = props.xlarge || largeWidth

  return (
    <div
      css={css`
        grid-column: span ${smallWidth};
        ${media.greaterThan('m')`
          grid-column: span ${mediumWidth};
        `}
        ${media.greaterThan('l')`
          grid-column: span ${largeWidth};
        `}
        ${media.greaterThan('xl')`
          grid-column: span ${xLargeWidth};
        `}
      `}
      className={cx('grid-item', props.className)}
    >
      {props.children}
    </div>
  )
}

export default GridItem
