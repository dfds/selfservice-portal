import React from 'react'
import { Checkbox } from '@/dfds-ui/forms/src'

import { TableRowProps } from './TableRow.types'

import TableCell from './TableCell'
import { tableCellCheckboxStyles } from './TableCell.styles'
import { tableRowStyles } from './TableRow.styles'

const TableRow = React.memo(
  ({ headerRow, isActive, onClickRow, onSelectRow, row, selectableRows, selectedRows }: TableRowProps) => (
    <tr
      css={tableRowStyles({ active: isActive, hoverColor: !!onClickRow })}
      className={row.className}
      onClick={() => onClickRow && onClickRow(row.id ? String(row.id) : '')}
    >
      {selectableRows && row.id && (
        <td css={tableCellCheckboxStyles}>
          <Checkbox
            checked={selectedRows.includes(row.id)}
            name={row.id}
            onChange={() => {
              if (!row.id) return

              onSelectRow(row.id)
            }}
            onLabelClick={(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
              e.stopPropagation()
            }}
            visualSize="small"
          />
        </td>
      )}

      {headerRow.map((headerCell, index) => (
        <TableCell headerCell={headerRow?.[index]} key={index}>
          {row[headerCell.key] || '-'}
        </TableCell>
      ))}
    </tr>
  )
)

export default TableRow
