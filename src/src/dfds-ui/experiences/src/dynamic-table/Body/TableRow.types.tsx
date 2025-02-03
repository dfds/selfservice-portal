import { Header, Row } from '../DynamicTable.types'

export type TableRowProps = {
  headerRow: Header[]
  isActive: boolean
  onClickRow?: (id: string) => void
  onSelectRow: (id: string) => void
  row: Row
  selectableRows: boolean
  selectedRows: string[]
}
