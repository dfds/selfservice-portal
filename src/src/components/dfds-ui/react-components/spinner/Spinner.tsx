import React from 'react'
import styled from '@emotion/styled'
import { keyframes, css } from '@emotion/react'
import { SvgAnimatedSpinner } from '@/components/dfds-ui/icons'
import { theme } from '@/components/dfds-ui/theme'
import { PolymorphicComponentProps } from '../common/polymorphic'

type Color = 'dark' | 'secondary' | 'light'

export type SpinnerProps = {
  /**
   * Indicates that Spinner will show up instantaneously (instead of fading in).
   *
   */
  instant?: boolean
  /**
   * Specifies the size of the Spinner.
   *
   * @deprecated Use css instead.
   */
  size?: string
  /**
   * Class name to be assigned to component.
   */
  className?: string
  /**
   * Set the color variant to use.
   */
  color?: Color
} & PolymorphicComponentProps

const paths = 8
const duration = 0.8
const delay = duration / paths

const spin = keyframes`
  0%, 25% {
    opacity: 1;
  }
  100% {
    opacity: .25;
  }
`

const fade = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
  `

const InstantSpinner = styled(SvgAnimatedSpinner)<{ size?: string }>`
  width: ${(p) => p.size || '1.5em'};
  height: ${(p) => p.size || '1.5em'};

  path {
    animation: ${spin} ${duration}s infinite;

    ${() => {
      let delays = ``
      for (let i = 1; i < paths; i++) {
        delays += `
          &:nth-of-type(${i}) {
            opacity: ${1.05 - i / paths};
            animation-delay: ${delay * i}s;
          }
        `
      }
      return delays
    }}
  }
`

const FadedSpinner = styled(InstantSpinner)`
  opacity: 0;
  animation: ${fade} 2s ease 0.6s forwards;
`

/**
 * A spinner is used to give user a sense of progress, when the time required to complete the given task is not known.
 */
export function Spinner({ instant, size, className, color = 'dark', as = 'div', ...rest }: SpinnerProps) {
  const Svg = instant ? InstantSpinner : FadedSpinner
  const colorPicker =
    color == 'dark'
      ? theme.colors.primary.main
      : color == 'light'
      ? theme.colors.surface.primary
      : theme.colors.secondary.main

  const Component = as

  return (
    <Component
      className={className}
      css={css`
        color: ${colorPicker};
      `}
      {...rest}
    >
      <Svg width={32} height={32} viewBox="0 0 32 32" size={size} />
    </Component>
  )
}

Spinner.displayName = 'Spinner'

/**
 * @deprecated Style the regular spinner to achieve the desired effect.
 */
export const CenteredSpinner = styled(Spinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

export default Spinner
