import React, { FunctionComponent, ReactNode } from 'react'
import styled from '@emotion/styled'

export type CardMediaProps = {
  /**
   * Media component to be displayed
   */
  media: ReactNode

  /**
   * Aspect ratio of media component
   */
  aspectRatio?: AspectRatio

  /**
   * className to be assigned to the component
   */
  className?: string
}

export type AspectRatio = '2:1' | '3:2'

function toPercent({ aspectRatio }: { aspectRatio: AspectRatio }) {
  return aspectRatio === '3:2' ? '66.6667%' : '50.00%'
}

const MediaContainer = styled.div`
  position: relative;
  overflow: hidden;
`

const AspectWrapper = styled.div<{ aspectRatio: AspectRatio }>`
  &::after {
    display: block;
    content: '';
    padding-bottom: ${toPercent};
  }

  img {
    position: absolute;
    object-fit: cover;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`

const CardMedia: FunctionComponent<CardMediaProps> = ({ children, media, aspectRatio = '2:1', ...rest }) => {
  return (
    <MediaContainer {...rest}>
      <AspectWrapper aspectRatio={aspectRatio}>
        {media}
        {children}
      </AspectWrapper>
    </MediaContainer>
  )
}

export default CardMedia
