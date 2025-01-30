import React, { ReactNode, Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { legacyMedia as media } from '@dfds-ui/react-components'
import { Divider } from '@dfds-ui/react-components/divider'

export type ModalHeaderProps = {
  className?: string
  sticky?: boolean
  children?: ReactNode
  noDivider?: boolean
}

const stickyStyles = css`
  ${media.lt('md')} {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
  }
`

export const ModalHeader = ({ children, className, sticky, noDivider = false, ...rest }: ModalHeaderProps) => {
  return (
    <Fragment>
      <div
        className={className}
        css={css`
          min-height: 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: ${theme.spacing.s};
          background-color: ${theme.colors.surface.primary};
          ${sticky && stickyStyles};
        `}
        {...rest}
      >
        {children}
      </div>
      {!noDivider && <Divider />}
    </Fragment>
  )
}

export default ModalHeader
