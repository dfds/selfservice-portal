import React from 'react'
import { useToaster } from './Toaster'

const DemoToaster = ({ message }: { message: React.ReactNode }) => {
  const { addToast } = useToaster()
  const handleOnClick = () => {
    const rn = Math.floor(Math.random() * 100 + 1)
    const isOdd = rn % 2 == 0
    if (isOdd) {
      return addToast({ children: message, intent: 'success' })
    }
    // TODO: Remove eslint-disable
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    return addToast({ children: message, intent: 'warning', timeout: 1000 })
  }
  return (
    <div>
      {/* TODO: Remove eslint-disable */}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <button onClick={handleOnClick}>Trigger Me!</button>
    </div>
  )
}

export default DemoToaster
