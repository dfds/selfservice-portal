import React from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import Asterisk from '../asterisk/Asterisk'
import { theme } from '@/components/dfds-ui/theme'

export type LabelProps = {
  required?: boolean
  size?: string
  htmlFor?: string
  inverted?: boolean
  hideAsterisk?: boolean
}

const labelStyles = css`
  font-weight: bold;
  line-height: 1.25;
`

const labelSmallStyles = css`
  font-weight: bold;
  line-height: 1.25;
  font-size: 12px;
`
const LabelTag = styled.label<{ inverted?: boolean; size?: string }>`
  ${(p) =>
    p.inverted
      ? css`
          color: ${theme.colors.text.light.primary};
        `
      : css`
          color: ${theme.colors.text.primary.primary};
        `};
  ${(p) =>
    p.size === 'small'
      ? css`
          ${labelSmallStyles}
        `
      : css`
          ${labelStyles}
        `}
`

const Label: React.FunctionComponent<LabelProps> = ({ required, children, hideAsterisk, ...rest }) => {
  return (
    <LabelTag {...rest}>
      {children}
      {required && !hideAsterisk && <Asterisk />}
    </LabelTag>
  )
}

export default Label
