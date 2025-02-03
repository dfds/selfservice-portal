import React from 'react'

import { TableCellProps } from './TableCell.types'

import { tableCellStyles } from './TableCell.styles'

const TableCell = React.memo(({ children, headerCell }: TableCellProps) => (
  <td
    css={tableCellStyles({
      align: headerCell?.textAlign,
      customWidth: headerCell?.width,
    })}
    data-cy={`dynamic-table-cell-${headerCell?.key}`}
  >
    {children}
  </td>
))

export default TableCell
