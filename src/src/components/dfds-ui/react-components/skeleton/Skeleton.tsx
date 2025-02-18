import { theme } from '@/components/dfds-ui/theme'
import { keyframes } from '@emotion/react'
import { css } from '@emotion/react'

import React from 'react'

const Pulse = () => keyframes`
    0% { background-color: rgba(77, 78, 76, 0.16); }
    50% { background-color: rgba(255,255,255, 0.32); }
    100% { background-color: rgba(77, 78, 76, 0.16); }
`

const getBorderRadius = (variant: SkeletonVariant): string => {
  if (variant === 'circle') return '50%'
  if (variant === 'text') return theme.spacing.xxs
  return 'unset'
}

const skeletonStyles = ({
  variant,
  disableAnimation,
}: {
  variant: SkeletonVariant
  disableAnimation: boolean | undefined
}) => css`
  position: relative;
  overflow: hidden;
  border-radius: ${getBorderRadius(variant)};
  background-color: rgba(77, 78, 76, 0.16);
  &::after {
    animation-duration: 2.8s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: ${!disableAnimation && Pulse()};
    animation-timing-function: linear;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(77, 78, 76, 0.16);
    position: absolute;
  }
`

export interface SkeletonProps {
  variant: SkeletonVariant
  disableAnimation?: boolean
}

export type SkeletonVariant = 'text' | 'circle' | 'rect'

export const Skeleton = ({ variant, disableAnimation, ...rest }: SkeletonProps) => (
  <div css={skeletonStyles({ variant, disableAnimation })} {...rest} />
)

export default Skeleton
