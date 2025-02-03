import React from 'react'

export type Header = {
  displayName: string | React.ReactElement
  key: string
  sortKey?: string
  sortable?: boolean
  textAlign?: 'center' | 'left' | 'right'
  width?: string
}

export type Row = {
  className?: string
  id?: string
  [name: string]: any
}

export type DynamicTableProps = {
  activeRow?: string
  descending?: boolean
  headerRow: Header[]
  height?: string
  isLoading?: boolean
  onClickRow?: (id: string) => void
  onSelectRow?: (list: string[]) => void
  onSort?: (value: string, sortDescending: boolean) => void
  rows: Row[]
  selectedRows?: string[]
  sortingBy?: string
  stickyHeader?: boolean
  translate?: 'yes' | 'no'
}
