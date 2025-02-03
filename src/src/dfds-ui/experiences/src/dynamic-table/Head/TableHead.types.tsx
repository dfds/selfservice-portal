import { Header, Row } from '../DynamicTable.types'

export type TableHeadProps = {
  headerRow: Header[]
  onSelectRow?: (list: string[]) => void
  onSort?: (value: string, sortDescending: boolean) => void
  rows: Row[]
  selectableRows: boolean
  selectedRows: string[]
  setSortDescending: (arg: boolean) => void
  setSortByKeyValue: (value: string) => void
  sortDescending: boolean
  sortByKeyValue: string
  stickyHeader?: boolean
}

export type GenericTableHeadCellProps = {
  sortable?: boolean
  sortByKey?: (value: string, sortDescending: boolean) => void
  stickyHeader?: boolean
}

export interface TableHeadCellProps extends GenericTableHeadCellProps {
  align?: 'center' | 'left' | 'right'
  customWidth?: string
  sortByKey?: (value: string, sortDescending: boolean) => void
  stickyHeader?: boolean
}

export type TableHeadCellCheckboxProps = {
  stickyHeader?: boolean
}

export type ChevronProps = { descending: string; show: string }
