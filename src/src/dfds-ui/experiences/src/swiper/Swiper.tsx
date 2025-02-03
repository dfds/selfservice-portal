import React from 'react'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import { css } from '@emotion/react'

export type SwiperProps = React.PropsWithChildren<{ className?: string }>

export const Swiper = ({ className, children }: SwiperProps) => {
  return (
    <FlexBox
      className={className}
      css={css`
        align-items: stretch;
        overflow-x: scroll;
        -ms-overflow-style: none;
        scrollbar-width: none;

        ::-webkit-scrollbar {
          display: none;
        }
      `}
    >
      {children}
    </FlexBox>
  )
}
