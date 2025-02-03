import React from 'react'
import Popper from './Popper'
import { css } from '@emotion/react'
import { PopperPlacementType } from '@mui/base'

export default {
  title: 'Hydro UI/Popper',
  component: Popper,
  argTypes: {
    placementOptions: {
      defaultValue: 'top',
      options: [
        'top-start',
        'top',
        'top-end',
        'left-start',
        'left',
        'left-end',
        'right-start',
        'right',
        'right-end',
        'bottom-start',
        'bottom',
        'bottom-end',
      ],
      control: { type: 'select' },
    },
  },
}

export const Basic = ({ placementOptions }: { placementOptions: PopperPlacementType }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const id = Boolean(anchorEl) ? 'buttonId' : undefined

  return (
    <div
      css={css`
        display: flex;
        width: 100%;
        /** Just to place the button in the middle of the screen */
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 48px);
      `}
    >
      <button aria-describedby={id} onClick={handleClick}>
        Show Popper
      </button>

      <Popper placement={placementOptions} anchorEl={anchorEl} id={id} setAnchorEl={setAnchorEl}>
        <div>Popper content</div>
      </Popper>
    </div>
  )
}
