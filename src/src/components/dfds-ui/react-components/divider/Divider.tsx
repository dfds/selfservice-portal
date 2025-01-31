import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

export type DividerProps = {
  //todo: convert to surface concept and remove light
  /**
   * Display the Divider in "light" mode.
   */
  light?: boolean
  /**
   * Display the Divider in "indent" style
   */
  indent?: boolean
  /**
   *  Display the Divider in "margin" style
   */
  margins?: boolean
  /**
   * HTML tag or custom component being rendered
   */
  as?: React.ElementType
  /**
   * Class name to be assigned to the component
   */
  className?: string
}

const { colors } = theme

// Can be used to create a simple divider with a css border and still adhere to the colors defined for dividers.
export const dividerBorder = (light?: boolean, placement?: 'top' | 'bottom') => {
  const border = `1px solid ${light ? colors.divider.light : colors.divider.dark}`
  return css`
    border-top: ${placement === 'top' && border};
    border-bottom: ${placement === 'bottom' && border};
  `
}

const StyledDivider = styled.hr<{ light?: boolean; indent?: boolean; margins?: boolean }>`
  border: none;
  background-color: ${(p) => (p.light ? colors.divider.light : colors.divider.dark)};
  max-width: 100%;
  height: 1px;
  margin: 0 ${(p) => (p.margins ? theme.spacing.m : 0)} 0 ${(p) => (p.margins || p.indent ? theme.spacing.m : 0)};
`

export const Divider = ({ light, indent, margins, ...rest }: DividerProps) => {
  return <StyledDivider light={light} indent={indent} margins={margins} role="separator" {...rest} />
}

export default Divider
