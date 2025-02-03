import React from 'react'
import { render } from '@testing-library/react'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '../'
import data from '../data.demo'

describe('<Table />', () => {
  it('should render without errors', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Route</TableHeaderCell>
            <TableHeaderCell>Departure</TableHeaderCell>
            <TableHeaderCell>Arrival</TableHeaderCell>
            <TableHeaderCell align="right">Remarks</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((booking) => (
            <TableRow key={booking.id}>
              <TableDataCell>{booking.status}</TableDataCell>
              <TableDataCell>{booking.route}</TableDataCell>
              <TableDataCell>{booking.departsAt}</TableDataCell>
              <TableDataCell>{booking.arrivesAt}</TableDataCell>
              <TableDataCell>{booking.remarks}</TableDataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  })
})
