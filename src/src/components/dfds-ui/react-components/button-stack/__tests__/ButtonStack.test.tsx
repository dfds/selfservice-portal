import React from 'react'
import { render } from '@testing-library/react'
import ButtonStack from '../ButtonStack'
import { Button } from '../../button'

describe('<ButtonStack />', () => {
  it('should render without errors', () => {
    render(
      <ButtonStack>
        <Button>Click me</Button>
      </ButtonStack>
    )
  })
})
