import React, { useCallback } from 'react'
import { ChevronDown } from '@/dfds-ui/icons/src/system'
import { Checkbox } from '@/dfds-ui/react-components/src'

import { Header } from '../DynamicTable.types'
import { TableHeadProps } from './TableHead.types'

import { chevronStyles, tableHeadCellCheckboxStyles, tableHeadCellStyles } from './TableHead.styles'
import { genericTableRowStyles } from '../Body/TableRow.styles'

const TableHead = React.memo(
  ({
    headerRow,
    onSelectRow,
    onSort,
    rows,
    selectableRows,
    selectedRows,
    setSortDescending,
    setSortByKeyValue,
    sortDescending,
    sortByKeyValue,
    stickyHeader,
  }: TableHeadProps) => {
    const toggleAll = useCallback(() => {
      if (!onSelectRow) return

      const newArray = []
      if (selectedRows.length === 0) {
        for (let i = 0; i < rows.length; i++) {
          newArray.push(rows[i].id || '')
        }
      }

      onSelectRow(newArray)
    }, [onSelectRow, rows, selectedRows])

    const sort = useCallback(
      (oldKey: string, newKey: string) => {
        if (!onSort) return

        if (oldKey !== newKey) {
          setSortByKeyValue(newKey)
          setSortDescending(false)
        } else {
          setSortDescending(!sortDescending)
        }
      },
      [onSort, setSortDescending, setSortByKeyValue, sortDescending]
    )

    return (
      <thead>
        <tr css={genericTableRowStyles}>
          {selectableRows && (
            <th css={tableHeadCellCheckboxStyles({ stickyHeader })}>
              <Checkbox checked={selectedRows.length > 0} indeterminate name="all" onChange={toggleAll} size="small" />
            </th>
          )}

          {headerRow.map((headerCell: Header, i: number) => {
            const sortKey = headerCell.sortKey || headerCell.key
            const clickHandler = () => headerCell.sortable && sort(sortByKeyValue, sortKey)
            const showChevron = String(sortByKeyValue === sortKey)

            return (
              <th
                align={headerCell.textAlign}
                css={tableHeadCellStyles({
                  align: headerCell.textAlign,
                  customWidth: headerCell.width,
                  sortByKey: onSort,
                  sortable: headerCell.sortable,
                  stickyHeader: stickyHeader,
                })}
                key={i}
                onClick={clickHandler}
              >
                <div>
                  <span>{headerCell.displayName}</span>

                  {headerCell.sortable && onSort && (
                    <ChevronDown css={chevronStyles({ descending: String(sortDescending), show: showChevron })} />
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
    )
  }
)

export default TableHead
