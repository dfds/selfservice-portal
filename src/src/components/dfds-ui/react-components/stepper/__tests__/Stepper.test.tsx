import React from 'react'

import { render } from '@testing-library/react'
import Stepper from '../Stepper'
import { Step } from '../../step'

describe('<Stepper />', () => {
  it('should render without errors', () => {
    render(
      <Stepper>
        <Step index={0} />
      </Stepper>
    )
  })
  describe('rendering children', () => {
    it('renders 3 Step, 3 StepButton and 3 StepLabel components', () => {
      const { queryAllByTestId } = render(
        <Stepper>
          <Step index={0} label=" step 1" />
          <Step index={1} label=" step 2" />
          <Step index={2} label=" step 3" />
        </Stepper>
      )
      const steps = queryAllByTestId('step')
      const stepButtons = queryAllByTestId('step-button')
      const stepLabel = queryAllByTestId('step-label')

      expect(steps.length).toBe(3)
      expect(stepButtons.length).toBe(3)
      expect(stepLabel.length).toBe(3)
    })
  })
  describe('controlling child props', () => {
    it('controls children state', () => {
      const { queryAllByTestId, unmount } = render(
        <Stepper activeStep={2}>
          <Step index={0} label=" step 1" completed={true} />
          <Step index={1} label=" step 2" completed={true} />
          <Step index={2} label=" step 3" />
        </Stepper>
      )
      expect(queryAllByTestId('step-button').length).toBe(3)
      expect(queryAllByTestId('step-button-index').length).toBe(1)
      expect(queryAllByTestId('step-button-completed').length).toBe(2)
      expect(queryAllByTestId('step-button-error').length).toBe(0)
      expect(queryAllByTestId('step-button-editing').length).toBe(0)
      unmount()
      render(
        <Stepper activeStep={2}>
          <Step index={0} label=" step 1" hasError={true} />
          <Step index={1} label=" step 2" completed={true} />
          <Step index={2} label=" step 3" isEditing={true} />
          <Step index={3} label=" step 4" />
        </Stepper>
      )
      expect(queryAllByTestId('step-button').length).toBe(4)
      expect(queryAllByTestId('step-button-index').length).toBe(1)
      expect(queryAllByTestId('step-button-completed').length).toBe(1)
      expect(queryAllByTestId('step-button-error').length).toBe(1)
      expect(queryAllByTestId('step-button-editing').length).toBe(1)
    })

    it('controls children sequentially based on the activeStep prop', () => {
      const { queryAllByTestId, unmount } = render(
        <Stepper activeStep={0}>
          <Step index={0} />
          <Step index={1} />
          <Step index={2} />
        </Stepper>
      )
      expect(queryAllByTestId('step-button-index').length).toBe(3)
      expect(queryAllByTestId('step-button-completed').length).toBe(0)
      unmount()
      render(
        <Stepper activeStep={1}>
          <Step index={0} />
          <Step index={1} />
          <Step index={2} />
        </Stepper>
      )
      expect(queryAllByTestId('step-button-index').length).toBe(2)
      expect(queryAllByTestId('step-button-completed').length).toBe(1)
    })
    it('controls children non-sequentially based on the activeStep prop', () => {
      const { queryAllByTestId, unmount } = render(
        <Stepper activeStep={0}>
          <Step index={0} />
          <Step index={1} />
          <Step index={2} />
        </Stepper>
      )
      expect(queryAllByTestId('step-button-index').length).toBe(3)
      expect(queryAllByTestId('step-button-completed').length).toBe(0)
      unmount()
      render(
        <Stepper activeStep={2} sequential={false}>
          <Step index={0} />
          <Step index={1} />
          <Step index={2} />
        </Stepper>
      )
      expect(queryAllByTestId('step-button-index').length).toBe(3)
      expect(queryAllByTestId('step-button-completed').length).toBe(0)
    })
  })
  it('renders with a null child', () => {
    const { queryAllByTestId } = render(
      <Stepper>
        <Step index={0} />
        {null}
      </Stepper>
    )
    const steps = queryAllByTestId('step')
    expect(steps.length).toBe(1)
  })
  describe('stepper feedback message', () => {
    const feedbackMessageText = 'feedback message'
    it('renders feedback message', () => {
      const { queryAllByTestId, getAllByText } = render(
        <Stepper stepFeedbackMessage={feedbackMessageText}>
          <Step index={0} />
          <Step index={1} />
        </Stepper>
      )
      const stepFeedbackMessage = queryAllByTestId('stepper-feedback-message')
      expect(stepFeedbackMessage.length).toBe(1)
      expect(stepFeedbackMessage.length).toBe(1)
      expect(getAllByText(feedbackMessageText).length).toBe(1)
    })
    it('renders feedback message in vertical orientation', () => {
      const { queryAllByTestId, getAllByText } = render(
        <Stepper stepFeedbackMessage={feedbackMessageText} orientation="vertical">
          <Step index={0} />
          <Step index={1} />
        </Stepper>
      )
      const stepFeedbackMessages = queryAllByTestId('stepper-feedback-message')
      expect(stepFeedbackMessages.length).toBe(1)
      expect(getAllByText(feedbackMessageText).length).toBe(1)
    })
    it('should all step labels and buttons in a hor horizontal step', () => {
      const { queryAllByTestId, getAllByText } = render(
        <Stepper stepFeedbackMessage={feedbackMessageText}>
          <Step index={0} label="label 1" />
          <Step index={1} label="label 2" />
        </Stepper>
      )
      const stepFeedbackMessages = queryAllByTestId('stepper-feedback-message')
      const stepButtons = queryAllByTestId('step-button')
      const stepLabels = queryAllByTestId('step-label')
      expect(stepFeedbackMessages.length).toBe(1)
      expect(getAllByText(feedbackMessageText).length).toBe(1)
      expect(stepLabels.length).toBe(0)
      expect(stepButtons.length).toBe(0)
    })
    it('should replace active step label and button in a vertical orientation step', () => {
      const { queryAllByTestId, getAllByText } = render(
        <Stepper stepFeedbackMessage={feedbackMessageText} orientation="vertical">
          <Step index={0} label="label 1" />
          <Step index={1} label="label 2" />
        </Stepper>
      )
      const stepFeedbackMessages = queryAllByTestId('stepper-feedback-message')
      const stepButtons = queryAllByTestId('step-button')
      const stepLabels = queryAllByTestId('step-label')
      expect(stepFeedbackMessages.length).toBe(1)
      expect(getAllByText(feedbackMessageText).length).toBe(1)
      expect(stepLabels.length).toBe(1)
      expect(stepButtons.length).toBe(1)
    })
  })
})
