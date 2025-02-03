import React from 'react'
import { Button } from '@/dfds-ui/react-components/src'

type Props = {
  name: string
  children: (args: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => React.ReactNode
}
const ModalDemo = (props: Props) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>{props.name}</Button>
      {props.children({ open, setOpen })}
    </div>
  )
}

export default ModalDemo
