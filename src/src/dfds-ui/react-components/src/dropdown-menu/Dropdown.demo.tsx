import React from 'react'
import { MoreHorizontal } from '@/dfds-ui/icons/src/system'
import { Button } from '../button'

type Props = {
  name: string
  children: (
    args: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> },
    ref: React.RefObject<any>
  ) => React.ReactNode
}

const DropdownDemo = (props: Props) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  const handleClick = (event: any) => {
    ref.current = event.currentTarget
    setOpen((state) => !state)
  }

  const id = open ? 'simple-popper' : undefined
  return (
    <>
      <Button
        aria-describedby={id}
        variation="secondary"
        icon={<MoreHorizontal />}
        iconAlign="right"
        onClick={handleClick}
      >
        {props.name}
      </Button>
      {props.children({ open, setOpen }, ref)}
    </>
  )
}

export default DropdownDemo
