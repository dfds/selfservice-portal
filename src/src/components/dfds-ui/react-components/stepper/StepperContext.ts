import React from 'react'
type StepperContextType = {
  activeStep: number
  orientation: 'horizontal' | 'vertical'
  sequential: boolean
  stepFeedbackMessage?: string
}

const StepperContext = React.createContext<StepperContextType>({
  activeStep: 1,
  orientation: 'horizontal',
  sequential: true,
})

export default StepperContext
