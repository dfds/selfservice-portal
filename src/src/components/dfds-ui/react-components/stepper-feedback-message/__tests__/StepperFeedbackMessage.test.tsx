import React from 'react'

import { render } from '@testing-library/react'

import StepperFeedbackMessage from '../StepperFeedbackMessage'
describe('<StepperFeedbackMessage />', () => {
  const feedbackMessageText = 'feedback message'
  it('should render without errors', () => {
    render(<StepperFeedbackMessage message={feedbackMessageText} />)
  })
  it('renders feedback message', () => {
    const { queryAllByTestId, getAllByText } = render(<StepperFeedbackMessage message={feedbackMessageText} />)
    const stepFeedbackMessage = queryAllByTestId('stepper-feedback-message')
    expect(getAllByText(feedbackMessageText).length).toBe(1)
    expect(stepFeedbackMessage.length).toBe(1)
    expect(getAllByText(feedbackMessageText).length).toBe(1)
  })
})
