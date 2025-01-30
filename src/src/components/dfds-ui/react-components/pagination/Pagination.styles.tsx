import { theme, media } from '@dfds-ui/theme'
import { css } from '@emotion/react'

export const paginationItemStyles = css`
  && {
    &:hover,
    &.Mui-selected:hover {
      background-color: rgba(73, 162, 223, 0.08);
    }

    &:focus,
    &.Mui-selected,
    &.Mui-selected:focus {
      background-color: rgba(73, 162, 223, 0.12);
    }

    &.MuiPaginationItem-sizeLarge {
      border-radius: 0;
    }

    &.MuiPaginationItem-root:hover > .MuiPaginationItem-icon,
    .MuiPaginationItem-root:focus > .MuiPaginationItem-icon {
      color: ${theme.colors.secondary.main};
    }

    &.MuiPaginationItem-root:active > .MuiPaginationItem-icon {
      color: ${theme.colors.secondary.dark};
    }

    &.MuiPaginationItem-root .MuiTouchRipple-root {
      display: none;
    }
  }
`

export const wrapperStyles = css`
  align-items: center;
  background-color: white;
  display: flex;
  justify-content: space-between;
  width: 100%;

  ${media.lessThan('l')`
    flex-direction: column;
    justify-content: center;
  `}
`

export const TextStyles = css`
  margin: 0;
`

const pageLimitWidth = '150px'

export const PageOverviewStyles = css`
  ${TextStyles}
  flex-grow: 1;
  min-width: ${pageLimitWidth};
`

export const PageLimitStyles = css`
  min-width: ${pageLimitWidth};
`

export const PageLimitWrapperStyles = css`
  display: flex;
  flex-grow: 1;
  justify-content: end;
  min-width: ${pageLimitWidth};
`
