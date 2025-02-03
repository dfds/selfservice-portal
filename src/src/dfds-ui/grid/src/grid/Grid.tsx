import React, { ReactNode } from 'react'
import { media, theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'
import cx from 'classnames'

export type GridProps = {
  children: ReactNode
  gap?: 's' | 'l'
  surface?: 'inverted' | 'dark' | 'transparent'
  top?: 's' | 'l'
  bottom?: 's' | 'l'
  className?: string
}

export const Grid = ({ gap, surface, top, bottom, children, className }: GridProps) => {
  const getSurface = () => {
    if (surface === 'dark') return theme.colors.surface.secondary
    if (surface === 'inverted') return theme.colors.surface.tertiary
    if (surface === 'transparent') return 'rgba(0,0,0,0)'
    return theme.colors.surface.primary
  }

  const getSize = (size?: string) => {
    if (size && size === 's') return theme.spacing.s
    if (size && size === 'l') return theme.spacing.l
    return 0
  }

  return (
    <>
      <div
        className={cx('grid-container', className)}
        css={css`
          background-color: ${getSurface()};
        `}
      >
        <div
          className="grid-inner-container"
          css={css`
            display: grid;
            margin: 0 auto; /* center in the viewport */
            grid-template-columns: repeat(12, 1fr);
            max-width: 1200px;
            grid-row-gap: 0;
            grid-column-gap: ${gap === 's' ? theme.spacing.s : theme.spacing.l};
            padding-top: ${getSize(top)};
            padding-bottom: ${getSize(bottom)};

            ${media.lessThanEqual('xl')`
              max-width: unset;
              margin-left: 40px;
              margin-right: 40px;
            `}

            ${media.lessThanEqual('m')`
              margin-left: 0;
              margin-right: 0;
              grid-column-gap: ${theme.spacing.s};
            `}
          `}
        >
          {children}
        </div>
      </div>
    </>
  )
}

export default Grid
