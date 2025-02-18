import React from 'react'
import { render } from '@testing-library/react'
import Tooltip from '../Tooltip'
import Button from '../../button/Button'

describe('<Tooltip />', () => {
  it('should render without errors', () => {
    render(
      <Tooltip content="This is tooltip text" placement="left">
        <Button>button</Button>
      </Tooltip>
    )
  })
})
