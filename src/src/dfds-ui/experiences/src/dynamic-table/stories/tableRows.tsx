import React from 'react'

import { Row } from '../DynamicTable.types'

const Currency = () => <span style={{ fontSize: '10px' }}>EUR</span>

const tableRows: Row[] = [
  {
    id: '1001',
    pallets: 10,
    from: 'Copenhagen',
    to: 'Stockholm',
    price: (
      <>
        <Currency /> <strong>200</strong>
      </>
    ),
  },
  {
    id: '1002',
    pallets: 41,
    from: 'Istanbul',
    to: 'London',
    price: (
      <>
        <Currency /> <strong>320</strong>
      </>
    ),
  },
  {
    id: '1003',
    pallets: 9,
    from: 'Delphi',
    to: 'Madrid',
    price: (
      <>
        <Currency /> <strong>1574</strong>
      </>
    ),
  },
  {
    id: '1004',
    pallets: 52,
    from: 'Stockholm',
    to: 'Amsterdam',
    price: (
      <>
        <Currency /> <strong>945.50</strong>
      </>
    ),
  },
  {
    id: '1005',
    pallets: 4,
    from: 'London',
    to: 'Paris',
    price: (
      <>
        <Currency /> <strong>850</strong>
      </>
    ),
  },
  {
    id: '1006',
    pallets: 33,
    from: 'Madrid',
    to: 'Berlin',
    price: (
      <>
        <Currency /> <strong>2000</strong>
      </>
    ),
  },
  {
    id: '1007',
    pallets: 17,
    from: 'Berlin',
    to: 'Oslo',
    price: (
      <>
        <Currency /> <strong>887</strong>
      </>
    ),
  },
  {
    id: '1008',
    pallets: 14,
    from: 'Oslo',
    to: 'Cairo',
    price: (
      <>
        <Currency /> <strong>2400</strong>
      </>
    ),
  },
  {
    id: '1009',
    pallets: 23,
    from: 'Paris',
    to: 'Rome',
    price: (
      <>
        <Currency /> <strong>1280.30</strong>
      </>
    ),
  },
]

export default tableRows
