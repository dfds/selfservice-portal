import { Header } from '../DynamicTable.types'

const headerRowSortable: Header[] = [
  { displayName: 'ID', key: 'id', sortable: true },
  { displayName: 'Pallets', key: 'pallets', textAlign: 'center' },
  { displayName: 'From', key: 'from', sortable: true },
  { displayName: 'To', key: 'to', sortable: true },
  { displayName: 'Price', key: 'price', textAlign: 'right' },
]

export default headerRowSortable
