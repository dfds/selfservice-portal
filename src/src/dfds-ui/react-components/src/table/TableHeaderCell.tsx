import React, { ComponentPropsWithRef, forwardRef, ReactNode } from 'react'
import { css } from '@emotion/react'
import { typography } from '@/dfds-ui/typography/src'
import { theme } from '@/dfds-ui/theme/src'

export type Alignment = 'left' | 'center' | 'right' | 'justify' | 'char'

export type TableHeaderCellProps = {
  /**
   * Sets alignment for the content in the tag
   */
  align?: Alignment

  /**
   * Table cell content
   */
  children: ReactNode
} & ComponentPropsWithRef<'th'>

export const getTableCellStyle = (align: Alignment = 'left') => css`
  border-bottom: 1px solid ${theme.colors.surface.secondary};
  min-width: 11rem;
  padding: 0 0.75rem;
  text-align: ${align};
`

const tableHeadCellStyle = (align: Alignment = 'left') => css`
  ${getTableCellStyle(align)}
  color: ${theme.colors.primary.main};
  ${typography.actionBold};
  text-align: ${align};

  th.is-sticky & {
    position: sticky;
  }
`

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ align = 'left', children, ...rest }: TableHeaderCellProps, ref) => {
    return (
      <th align={align} css={tableHeadCellStyle(align)} {...rest} ref={ref}>
        {children}
      </th>
    )
  }
)

export default TableHeaderCell
