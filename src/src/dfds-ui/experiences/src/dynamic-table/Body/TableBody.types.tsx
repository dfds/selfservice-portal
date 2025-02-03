import { Header, Row } from '../DynamicTable.types'

export type TableBodyProps = {
  activeRow?: string
  headerRow: Header[]
  onClickRow?: (id: string) => void
  onSelectRow?: (list: string[]) => void
  rows: Row[]
  selectableRows: boolean
  selectedRows: string[]
}
