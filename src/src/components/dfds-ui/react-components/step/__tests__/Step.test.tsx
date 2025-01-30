import React from 'react'

import { render } from '@testing-library/react'
import { Stepper } from '../../stepper'
import Step from '../Step'

describe('<Step />', () => {
  const Child = () => <div data-testid="child-component">child compoenent</div>
  describe('rendring children', () => {
    it('renders children', () => {
      const { queryAllByTestId } = render(
        <Stepper orientation="vertical">
          <Step index={0}>
            <Child />
            <Child />
          </Step>
        </Stepper>
      )
      expect(queryAllByTestId('child-component').length).toBe(2)
    })
    it('should handle null children', () => {
      const { queryAllByTestId } = render(
        <Stepper orientation="vertical">
          <Step index={0}>
            <Child />
            {null}
          </Step>
        </Stepper>
      )
      expect(queryAllByTestId('child-component').length).toBe(1)
      expect(queryAllByTestId('step-button')).not.toBe(null)
    })
  })
})
