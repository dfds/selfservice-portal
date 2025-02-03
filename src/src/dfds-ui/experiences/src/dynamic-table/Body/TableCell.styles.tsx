import { theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'

export const genericTableCellStyles = css`
  padding: 0 ${theme.spacing.xs};

  &:first-of-type {
    padding-left: ${theme.spacing.s};
  }

  &:last-of-type {
    padding-right: ${theme.spacing.s};
  }
`

type TableCellProps = {
  align?: 'center' | 'left' | 'right'
  customWidth?: string
}

export const tableCellStyles = ({ align, customWidth }: TableCellProps) => css`
  ${{ ...genericTableCellStyles }}

  min-width: ${customWidth || 'auto'};
  text-align: ${align || 'left'};
  width: ${customWidth || 'auto'};
`

export const tableCellCheckboxStyles = css`
  ${{ ...genericTableCellStyles }}

  max-width: 40px;
  width: 40px;
`
