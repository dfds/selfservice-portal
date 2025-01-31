import React, { ComponentPropsWithRef, forwardRef, ReactNode } from 'react'
import { css } from '@emotion/react'
import { typography } from '@/components/dfds-ui/typography'
import { theme } from '@/components/dfds-ui/theme'
import { Alignment, getTableCellStyle } from './TableHeaderCell'

export type TableDataCellProps = {
  /**
   * Sets alignment for the content in the tag
   */
  align?: Alignment

  /**
   * Table cell content
   */
  children: ReactNode
} & ComponentPropsWithRef<'td'>

const tableDataCellStyle = (align: Alignment = 'left') => css`
  ${getTableCellStyle(align)}
  color: ${theme.colors.text.dark.primary};
  ${typography.body};
  text-align: ${align};
`

export const TableDataCell = forwardRef<HTMLTableCellElement, TableDataCellProps>(
  ({ align = 'left', children, ...rest }: TableDataCellProps, ref) => {
    return (
      <td align={align} css={tableDataCellStyle(align)} {...rest} ref={ref}>
        {children}
      </td>
    )
  }
)

export default TableDataCell
