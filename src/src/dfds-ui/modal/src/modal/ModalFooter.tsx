import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { legacyMedia as media } from '@/dfds-ui/react-components/src'

export type ModalFooterProps = {
  className?: string
  sticky?: boolean
  children?: ReactNode
}

const stickyStyles = css`
  ${media.lt('md')} {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
  }
`

export const ModalFooter = ({ children, className, sticky, ...rest }: ModalFooterProps) => {
  return (
    <div
      className={className}
      css={css`
        background-color: blue;
        ${sticky && stickyStyles};
      `}
      {...rest}
    >
      {children}
    </div>
  )
}

export default ModalFooter
