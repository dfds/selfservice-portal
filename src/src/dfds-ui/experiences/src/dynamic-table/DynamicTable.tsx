import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { DynamicTableProps } from './DynamicTable.types'

import TableBody from './Body/TableBody'
import { tableStyles, tableWrapperStyles } from './DynamicTable.styles'
import TableHead from './Head/TableHead'
import createSkeletonRows from './Skeleton/helpers/createSkeletonRows'
import { fadeStyles } from './Skeleton/SkeletonTable.styles'

const DynamicTable: FunctionComponent<DynamicTableProps> = ({
  activeRow,
  descending,
  height,
  headerRow,
  isLoading,
  onClickRow,
  onSelectRow,
  onSort,
  rows,
  selectedRows = [],
  sortingBy,
  stickyHeader,
  ...rest
}) => {
  // states
  const [sortByKeyValue, setSortByKeyValue] = useState(sortingBy || '')
  const [sortDescending, setSortDescending] = useState((sortingBy && descending) || false)

  const selectableRows = !!onSelectRow

  const skeletonRows = useMemo(() => createSkeletonRows(headerRow), [headerRow])

  useEffect(() => {
    if (onSort) {
      onSort(sortByKeyValue, sortDescending)
    }
  }, [sortDescending, onSort, sortByKeyValue])

  return (
    <div css={tableWrapperStyles({ height })} {...rest}>
      <table css={tableStyles} data-cy={!isLoading ? `dynamic-table-isLoaded` : ''}>
        {headerRow && (
          <TableHead
            headerRow={headerRow}
            onSelectRow={onSelectRow}
            onSort={onSort}
            rows={rows}
            selectableRows={selectableRows}
            selectedRows={selectedRows}
            setSortDescending={setSortDescending}
            setSortByKeyValue={setSortByKeyValue}
            sortDescending={sortDescending}
            sortByKeyValue={sortByKeyValue}
            stickyHeader={stickyHeader}
          />
        )}

        <TableBody
          activeRow={activeRow}
          headerRow={headerRow}
          onClickRow={onClickRow}
          onSelectRow={onSelectRow}
          rows={!isLoading ? rows : skeletonRows}
          selectableRows={selectableRows}
          selectedRows={selectedRows}
        />
      </table>

      {isLoading && <div css={fadeStyles} />}
    </div>
  )
}

export default React.memo(DynamicTable)
