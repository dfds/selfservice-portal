import { theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'

export const genericTableRowStyles = css`
  border-bottom: 1px solid ${theme.colors.surface.secondary};
  border-collapse: collapse;
  height: 48px;
`

type TableRowProps = {
  active?: boolean
  hoverColor: boolean
}

export const tableRowStyles = ({ active, hoverColor }: TableRowProps) => css`
  ${{ ...genericTableRowStyles }}

  &:hover {
    ${hoverColor &&
    `
      background-color: ${theme.colors.surface.secondary};
      cursor: ${hoverColor && 'pointer'};
    `};
  }

  ${active &&
  `
    background-color: ${theme.colors.divider.dark};
  `};
`
