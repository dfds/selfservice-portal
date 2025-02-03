import React from 'react'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import { css } from '@emotion/react'

export type SwiperCardProps = React.PropsWithChildren<{ className?: string }>

export const SwiperCard = ({ className, children }: SwiperCardProps) => {
  return (
    <FlexBox
      className={className}
      css={css`
        min-width: 80%;
      `}
    >
      {children}
    </FlexBox>
  )
}
