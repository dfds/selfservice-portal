import React from 'react'
import Checkbox from './Checkbox'

type ExampleControlComponentProps = {
  onChange?: (...args: any[]) => void
  checked?: boolean
  error?: boolean
  disabled?: boolean
  size?: 'small' | 'medium'
}

const ExampleControlComponent: React.FunctionComponent<ExampleControlComponentProps> = ({
  checked: defaultChecked,
  children,
  ...rest
}) => {
  const [checked, setChecked] = React.useState(defaultChecked)

  return (
    <Checkbox onChange={() => setChecked((state) => !state)} checked={checked} name="test" {...rest}>
      {children}
    </Checkbox>
  )
}

export default ExampleControlComponent
