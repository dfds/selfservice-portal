import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

// space between label and stepButton
const spacing = theme.spacing.xs
const buttonWidth = theme.spacing.m
const connecterWidth = '1px'
export const stepWrapperHorizontalStyles = css`
  display: flex;
  gap: ${spacing};
  align-items: center;
  box-sizing: border-box;
  &:not(:last-child) {
    flex: 1;
    &:after {
      box-sizing: border-box;
      content: '';
      height: ${connecterWidth};
      background-color: ${theme.colors.text.primary.disabled};
      flex: 1;
      width: 100%;
      margin-right: ${spacing};
    }
  }
`

export const stepWrapperVerticalStyles = css`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 2em;
  &:not(:last-child) {
    &:after {
      box-sizing: border-box;
      position: absolute;
      content: '';
      top: calc(${buttonWidth} + ${spacing});
      transform: translateX(calc((${buttonWidth} / 2) - 1px));
      width: ${connecterWidth};
      background: ${theme.colors.text.primary.disabled};
      height: calc(100% - ${buttonWidth} - (2 * ${spacing}));
    }
  }
`

export const stepHeaderStyles = css`
  gap: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
`

export const stepContentStyles = css`
  transform: translateX(calc(3 * ${spacing}));
`
