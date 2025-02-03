import { Header, Row } from '../DynamicTable.types'

const getHeaderRow = (rows: Row[], customHeaderRow?: Header[]) => {
  // If there are no headers, make some from the keys of the first row.
  const headers = customHeaderRow || []

  if (!customHeaderRow) {
    const rowKeys = Object.keys(rows[0] || {})
    for (let i = 0; i < rowKeys.length; i++) {
      headers.push({
        displayName: rowKeys[i],
        key: rowKeys[i],
      })
    }
  }

  return headers
}

export default getHeaderRow
