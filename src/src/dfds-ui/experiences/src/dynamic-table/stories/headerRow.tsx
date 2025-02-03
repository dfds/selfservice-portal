import { Header } from '../DynamicTable.types'

const headerRow: Header[] = [
  { displayName: 'ID', key: 'id', width: '80px' },
  { displayName: 'Pallets', key: 'pallets', textAlign: 'center' },
  { displayName: 'From', key: 'from' },
  { displayName: 'To', key: 'to' },
  { displayName: 'Price', key: 'price', textAlign: 'right' },
]

export default headerRow
