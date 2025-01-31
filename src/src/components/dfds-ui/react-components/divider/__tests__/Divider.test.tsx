import React from 'react'
import { render } from '@testing-library/react'
import Divider from '../Divider'
import { theme } from '@/components/dfds-ui/theme'

describe('<Divider />', () => {
  it('should render without errors', () => {
    render(<Divider />)
  })
})

test('Should render divider in default color', () => {
  const { container } = render(<Divider />)
  expect(container.querySelector('hr')).toHaveStyleRule('background-color', theme.colors.divider.dark)
})

test('Should render with white color with light prop', () => {
  const { container } = render(<Divider light />)
  expect(container.querySelector('hr')).toHaveStyleRule('background-color', theme.colors.divider.light)
})

test('Should render with left-margin with indent prop', () => {
  const { container } = render(<Divider indent />)
  expect(container.querySelector('hr')).toHaveStyleRule('margin', `0 0 0 ${theme.spacing.m}`)
})

test('Should render with margins with margins prop', () => {
  const { container } = render(<Divider margins />)
  expect(container.querySelector('hr')).toHaveStyleRule('margin', `0 ${theme.spacing.m} 0 ${theme.spacing.m}`)
})
