import React, { ReactNode } from 'react'

export type StepContextType = {
  index: number
  active: boolean
  hasError?: boolean
  completed?: boolean
  disabled?: boolean
  isEditing?: boolean
  feedback?: ReactNode
}

const StepContext = React.createContext<StepContextType>({
  completed: false,
  active: false,
  disabled: false,
  index: 0,
})

export default StepContext
