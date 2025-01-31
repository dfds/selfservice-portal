import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

export type ProgressBarProps = { light?: boolean; indeterminate?: boolean; progress?: number }

const StyledProgressBar = styled.div<{ progress?: number; indeterminate: boolean; light?: boolean }>`
  height: 4px;
  background: ${(p) => (p.light ? theme.colors.text.light.disabled : theme.colors.text.primary.disabled)};
  border-radius: ${theme.radii.m};
  position: relative;
  margin: 8px 0;
  overflow: hidden;

  &:before,
  &:after {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${theme.radii.m};
    height: 100%;
    background: ${(p) => (p.light ? theme.colors.text.light.primary : theme.colors.text.primary.primary)};
    width: 100%;
    z-index: 1;
    transform-origin: 0 0;
  }

  &:before {
    ${({ indeterminate, progress }) =>
      indeterminate
        ? css`
            width: 100%;
            will-change: max-width, transform;

            animation: loading-alpha 2s linear infinite;
            @keyframes loading-alpha {
              0%,
              100% {
                max-width: 0;
                transform: translateX(0);
              }
              5% {
                max-width: 5%;
                transform: translateX(0);
              }
              57% {
                max-width: 35%;
              }
              85% {
                max-width: 0;
                /** avoid having to read clientWidth of the bar*/
                transform: translateX(100vw);
              }
            }
          `
        : !!progress
        ? css`
            transition: transform 0.2s linear;
            transform: scaleX(${Math.max(0, Math.min(progress || 0, 100)) / 100});
          `
        : ``}
  }

  &:after {
    ${(p) =>
      p.indeterminate
        ? css`
            width: 100%;
            will-change: max-width, transform;
            transform-origin: 0 0;
            animation: loading-beta 2s linear infinite;
            @keyframes loading-beta {
              0%,
              60% {
                max-width: 0;
                transform: translateX(0);
              }
              75% {
                max-width: 35%;
                transform: translateX(0);
              }
              100% {
                max-width: 5%;
                transform: translateX(100vw);
              }
            }
          `
        : `
            visibility: hidden;
        `}
  }
`

const ProgressBar = ({ light = false, indeterminate = false, progress = 0 }: ProgressBarProps) => {
  return <StyledProgressBar light={light} indeterminate={indeterminate} progress={progress} />
}

export default ProgressBar
