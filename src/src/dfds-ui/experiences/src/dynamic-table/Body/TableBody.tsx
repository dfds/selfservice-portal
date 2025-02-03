import React, { useCallback } from 'react'

import { TableBodyProps } from './TableBody.types'

import TableRow from './TableRow'

const TableBody = React.memo(
  ({ activeRow, headerRow, onClickRow, onSelectRow, rows, selectableRows, selectedRows }: TableBodyProps) => {
    // update state and callback functions
    const updateSelectedRows = useCallback(
      (id: string) => {
        if (onSelectRow && selectableRows) {
          const selection = [...selectedRows]

          if (selectedRows.includes(id)) {
            const index = selectedRows.indexOf(id)

            if (index !== -1) selection.splice(index, 1)
            onSelectRow(selection)
          } else {
            selection.push(id)
            onSelectRow(selection)
          }
        }
      },
      [selectableRows, selectedRows]
    )

    return (
      <tbody>
        {rows.map((row, index) => (
          <TableRow
            headerRow={headerRow}
            isActive={activeRow ? row.id === activeRow : false}
            key={index}
            onClickRow={onClickRow}
            onSelectRow={updateSelectedRows}
            row={row}
            selectableRows={selectableRows}
            selectedRows={selectedRows}
          />
        ))}
      </tbody>
    )
  }
)

export default TableBody
