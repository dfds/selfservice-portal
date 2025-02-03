import React from 'react'
import { render } from '@testing-library/react'
import SideSheet from '../SideSheet'

describe('<SideSheet/>', () => {
  it('should render without errors', () => {
    render(
      <>
        <SideSheet variant="nested" isOpen width="10rem" />
        <SideSheet variant="elevated" isOpen width="10rem" />
        <SideSheet variant="elevated" backdrop isOpen width="10rem" />
        <SideSheet variant="elevated" backdrop backdropEmphasis="low" isOpen width="10rem" />
      </>
    )
  })
})
